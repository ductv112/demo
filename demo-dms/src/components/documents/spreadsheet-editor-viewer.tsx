'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import { textRenderer } from 'handsontable/renderers';
import 'handsontable/dist/handsontable.full.min.css';
import type { HotTableRef } from '@handsontable/react-wrapper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Save, AlertCircle, Info, Download,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Plus, X,
  Type, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateDocumentFile } from '@/lib/documents-api';
import { SaveWithNoteDialog } from './save-with-note-dialog';

registerAllModules();

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpreadsheetEditorViewerProps {
  url: string;
  fileName: string;
  mimeType: string;
  documentId: string;
  canEdit: boolean;
  /** True nếu user thực sự có quyền EDITOR/OWNER (dù đang ở preview mode).
   *  Khi true VÀ canEdit=false (preview mode), KHÔNG hiển thị badge "Chỉ xem" để tránh gây nhầm lẫn.
   *  refs bug #143
   */
  userHasEditPermission?: boolean;
  onSaveFile?: (file: File) => Promise<void>;
  /** Callback sau khi save thành công — dùng để notify parent re-fetch document (cập nhật extractionStatus) */
  onDocumentSaved?: () => Promise<void>;
}

interface SheetData {
  name: string;
  colHeaders: string[];
  data: any[][];
}

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontFamily?: string;
  wordWrap?: boolean;
  numberFormat?: 'general' | 'number' | 'currency' | 'percent' | 'date';
  borderAll?: boolean;
  borderOutline?: boolean;
  borderThick?: boolean;
}

// key = "sheetIdx:row:col"
type StylesStore = Record<string, CellStyle>;

const LARGE_FILE_ROWS = 10_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sk(sheet: number, row: number, col: number) {
  return `${sheet}:${row}:${col}`;
}

function colToLetter(col: number): string {
  let result = '';
  let n = col;
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function parseExcelColor(color: Partial<ExcelJS.Color> | undefined): string | undefined {
  if (!color?.argb) return undefined;
  const hex = color.argb.slice(2);
  return hex ? `#${hex}` : undefined;
}

function parseSheetData(jsonData: any[][]): { colHeaders: string[]; dataRows: any[][] } {
  const colHeaders: string[] = [];
  if (jsonData.length > 0) {
    const headerRow = jsonData[0];
    for (let i = 0; i < headerRow.length; i++) {
      colHeaders.push(
        headerRow[i] != null ? String(headerRow[i]) : `Cột ${i + 1}`
      );
    }
  }
  if (colHeaders.length === 0) colHeaders.push('A');

  const dataRows = jsonData.slice(1).map((row) => {
    const r = [...row];
    while (r.length < colHeaders.length) r.push(null);
    return r;
  });

  if (dataRows.length === 0) dataRows.push(new Array(colHeaders.length).fill(null));
  return { colHeaders, dataRows };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SpreadsheetEditorViewer({
  url, fileName, mimeType, documentId, canEdit, userHasEditPermission, onSaveFile, onDocumentSaved,
}: SpreadsheetEditorViewerProps) {
  const t = useTranslations('documents');
  const hotRef = useRef<HotTableRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // All sheet data (state for re-render, ref for latest value in callbacks)
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const sheetsRef = useRef<SheetData[]>([]);

  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const activeSheetIndexRef = useRef(0);

  // ── All styles in a SINGLE flat object keyed by "sheetIdx:row:col" ──
  // Using a ref so the renderer always reads the latest value synchronously,
  // and a state counter to trigger re-renders when we want them.
  const stylesRef = useRef<StylesStore>({});
  const [styleVersion, setStyleVersion] = useState(0); // bump to force re-render

  // Merge cells per sheet — initial data loaded from XLSX file, sau đó Handsontable tự quản lý
  // trên sheet active hiện tại. Khi switch sheet → pass mergeCellsBySheetRef[newIdx] làm prop.
  const mergeCellsBySheetRef = useRef<Record<number, Array<{ row: number; col: number; rowspan: number; colspan: number }>>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [containerHeight, setContainerHeight] = useState(500);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Formula bar — dùng ref để tránh trigger re-render Handsontable khi chọn ô
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [selectedCellRef, setSelectedCellRef] = useState('');
  // selectedRow/Col lưu bằng ref (không re-render), chỉ dùng cho formula bar onBlur
  const selectedRowRef = useRef<number | null>(null);
  const selectedColRef = useRef<number | null>(null);
  // Lưu toàn bộ selection ranges để dùng khi hot.getSelected() trả về null (sau blur)
  const lastSelectionRef = useRef<[number, number, number, number][] | null>(null);

  // Sheet tab rename
  const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
  const [editingTabName, setEditingTabName] = useState('');

  // ── Sync activeSheetIndex to ref ──
  useEffect(() => {
    activeSheetIndexRef.current = activeSheetIndex;
  }, [activeSheetIndex]);

  // ── Measure container height ──
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.getBoundingClientRect().height;
      // Chỉ setState khi giá trị thực sự đổi để tránh re-render dư thừa → cascade
      // updateSettings của HotTable → lag khi resize thường xuyên.
      if (h > 10) {
        setContainerHeight((prev) => (Math.abs(prev - h) >= 1 ? h : prev));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!loading && wrapperRef.current) {
      const h = wrapperRef.current.getBoundingClientRect().height;
      if (h > 10) {
        setContainerHeight((prev) => (Math.abs(prev - h) >= 1 ? h : prev));
      }
    }
  }, [loading]);

  // ── Load spreadsheet ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    setIsModified(false);
    setActiveSheetIndex(0);
    activeSheetIndexRef.current = 0;
    stylesRef.current = {};
    mergeCellsBySheetRef.current = {};
    setStyleVersion(0);

    const load = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        let parsedSheets: SheetData[] = [];
        const newStyles: StylesStore = {};
        let totalRows = 0;

        if (mimeType === 'text/csv') {
          const csvText = await response.text();
          const wb = XLSX.read(csvText, { type: 'string' });
          for (const name of wb.SheetNames) {
            const ws = wb.Sheets[name];
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
            totalRows += jsonData.length;
            const { colHeaders, dataRows } = parseSheetData(jsonData);
            parsedSheets.push({ name, colHeaders, data: dataRows });
          }
        } else {
          const arrayBuffer = await response.arrayBuffer();

          // SheetJS → data
          const sheetJsWb = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetDataMap: Record<string, { colHeaders: string[]; dataRows: any[][] }> = {};
          for (const name of sheetJsWb.SheetNames) {
            const ws = sheetJsWb.Sheets[name];
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][];
            totalRows += jsonData.length;
            sheetDataMap[name] = parseSheetData(jsonData);
          }

          // ExcelJS → styles
          try {
            const excelWb = new ExcelJS.Workbook();
            await excelWb.xlsx.load(arrayBuffer);
            excelWb.eachSheet((worksheet, _sheetId) => {
              const sheetIdx = sheetJsWb.SheetNames.indexOf(worksheet.name);
              if (sheetIdx < 0) return;

              worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                  const font = cell.font;
                  const fill = cell.fill;
                  const alignment = cell.alignment;
                  const style: CellStyle = {};

                  if (font?.bold) style.bold = true;
                  if (font?.italic) style.italic = true;
                  if (font?.underline) style.underline = true;
                  if (font?.strike) style.strikethrough = true;
                  if (font?.color) {
                    const c = parseExcelColor(font.color as Partial<ExcelJS.Color>);
                    if (c && c !== '#000000') style.textColor = c;
                  }
                  if (font?.size) style.fontSize = font.size;
                  if (font?.name) style.fontFamily = font.name;
                  if (fill?.type === 'pattern' && (fill as ExcelJS.FillPattern).fgColor) {
                    const bg = parseExcelColor((fill as ExcelJS.FillPattern).fgColor as Partial<ExcelJS.Color>);
                    if (bg && bg !== '#ffffff') style.bgColor = bg;
                  }
                  if (alignment?.horizontal === 'center') style.align = 'center';
                  else if (alignment?.horizontal === 'right') style.align = 'right';
                  else if (alignment?.horizontal === 'left') style.align = 'left';
                  if (alignment?.wrapText) style.wordWrap = true;

                  // Number format mapping (đọc từ numFmt)
                  if (cell.numFmt) {
                    const fmt = cell.numFmt.toString().toLowerCase();
                    if (fmt.includes('%')) style.numberFormat = 'percent';
                    else if (fmt.includes('₫') || fmt.includes('vnd') || fmt.includes('$')) style.numberFormat = 'currency';
                    else if (fmt.includes('yyyy') || fmt.includes('dd') || fmt.includes('mm/dd')) style.numberFormat = 'date';
                    else if (fmt.includes('#,##0') || fmt.includes('0.00')) style.numberFormat = 'number';
                  }

                  // Borders — đọc từ cell.border
                  const b = cell.border;
                  if (b && (b.top || b.left || b.right || b.bottom)) {
                    const hasMedium = [b.top, b.left, b.right, b.bottom].some(
                      (side) => side?.style === 'medium' || side?.style === 'thick'
                    );
                    const hasAllFour = b.top && b.left && b.right && b.bottom;
                    if (hasMedium) style.borderThick = true;
                    else if (hasAllFour) style.borderAll = true;
                    else style.borderOutline = true;
                  }

                  if (Object.keys(style).length > 0) {
                    const dataRowIdx = rowNumber - 2; // row 1 = header (skip), row 2 = data[0]
                    if (dataRowIdx >= 0) {
                      newStyles[sk(sheetIdx, dataRowIdx, colNumber - 1)] = style;
                    }
                  }
                });
              });

              // Extract merge cells → Handsontable format
              const merges: Array<{ row: number; col: number; rowspan: number; colspan: number }> = [];
              const modelMerges = (worksheet.model as any)?.merges as string[] | undefined;
              if (Array.isArray(modelMerges)) {
                for (const rangeStr of modelMerges) {
                  // rangeStr dạng "A1:B2"
                  const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(rangeStr);
                  if (!m) continue;
                  const colLetterToIdx = (s: string): number => {
                    let n = 0;
                    for (let i = 0; i < s.length; i++) {
                      n = n * 26 + (s.charCodeAt(i) - 64);
                    }
                    return n - 1; // 0-based
                  };
                  const startCol = colLetterToIdx(m[1]);
                  const startRow = parseInt(m[2], 10) - 2; // skip header, 0-based data row
                  const endCol = colLetterToIdx(m[3]);
                  const endRow = parseInt(m[4], 10) - 2;
                  if (startRow < 0 || endRow < 0) continue; // skip header merge
                  merges.push({
                    row: startRow,
                    col: startCol,
                    rowspan: endRow - startRow + 1,
                    colspan: endCol - startCol + 1,
                  });
                }
              }
              if (merges.length > 0) {
                mergeCellsBySheetRef.current[sheetIdx] = merges;
              }
            });
          } catch (_e) {
            console.warn('ExcelJS style extraction failed:', _e);
          }

          for (const name of sheetJsWb.SheetNames) {
            const { colHeaders, dataRows } = sheetDataMap[name];
            parsedSheets.push({ name, colHeaders, data: dataRows });
          }
        }

        if (parsedSheets.length === 0) {
          parsedSheets = [{ name: 'Sheet1', colHeaders: ['A', 'B', 'C'], data: [[null, null, null]] }];
        }

        sheetsRef.current = parsedSheets.map(s => ({ ...s, data: s.data.map(r => [...r]) }));
        stylesRef.current = newStyles;
        setSheets(parsedSheets);
        setIsLargeFile(totalRows > LARGE_FILE_ROWS);
        setLoading(false);
      } catch (err: any) {
        console.error('Spreadsheet load error:', err);
        setError('Không thể hiển thị file bảng tính.');
        setLoading(false);
      }
    };

    load();
  }, [url, mimeType]);

  // ── Keyboard shortcuts (Ctrl+S) ──
  // Ctrl+Z / Ctrl+Y: để browser/Handsontable built-in xử lý (chỉ hoạt động cho cell data edits,
  // không hoạt động cho style changes vì style lưu ngoài data model — đây là lý do bỏ nút Undo/Redo
  // khỏi toolbar để tránh gây hiểu nhầm, refs #150).
  useEffect(() => {
    if (!canEdit) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 's') { e.preventDefault(); if (isModified && !isSaving) handleSave(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [canEdit, isModified, isSaving]);

  // ── Cell renderer ──
  // Defined ONCE (no deps) — reads from refs so always has latest data.
  const cellRenderer = useCallback(function (
    this: any,
    hotInstance: any,
    TD: HTMLTableCellElement,
    row: number,
    col: number,
    prop: any,
    value: any,
    cellProperties: any,
  ) {
    textRenderer.call(this, hotInstance, TD, row, col, prop, value, cellProperties);

    const style = stylesRef.current[sk(activeSheetIndexRef.current, row, col)];
    if (!style) {
      TD.style.cssText = '';
      TD.style.color = '#000000'; // force black text regardless of theme
      return;
    }

    // Font
    TD.style.fontWeight = style.bold ? 'bold' : '';
    TD.style.fontStyle = style.italic ? 'italic' : '';
    const dec: string[] = [];
    if (style.underline) dec.push('underline');
    if (style.strikethrough) dec.push('line-through');
    TD.style.textDecoration = dec.join(' ');
    TD.style.color = style.textColor || '#000000';
    TD.style.backgroundColor = style.bgColor || '';
    TD.style.textAlign = style.align || '';
    TD.style.fontSize = style.fontSize ? `${style.fontSize}px` : '';
    TD.style.fontFamily = style.fontFamily || '';

    // Wrap
    if (style.wordWrap) {
      TD.style.whiteSpace = 'normal';
      TD.style.wordBreak = 'break-word';
    } else {
      TD.style.whiteSpace = '';
      TD.style.wordBreak = '';
    }

    // Number format
    if (style.numberFormat && value != null && style.numberFormat !== 'general') {
      const num = Number(value);
      if (!isNaN(num)) {
        if (style.numberFormat === 'number') TD.textContent = num.toLocaleString('vi-VN');
        else if (style.numberFormat === 'currency') TD.textContent = num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        else if (style.numberFormat === 'percent') TD.textContent = (num * 100).toFixed(2) + '%';
        else if (style.numberFormat === 'date') {
          const d = new Date(num);
          if (!isNaN(d.getTime())) TD.textContent = d.toLocaleDateString('vi-VN');
        }
      }
    }

    // Borders
    if (style.borderThick) TD.style.border = '2px solid #000';
    else if (style.borderAll) TD.style.border = '1px solid #999';
    else TD.style.border = '';
    TD.style.outline = style.borderOutline ? '2px solid #000' : '';
  }, []); // empty deps — intentional, reads from refs

  // ── Get selected cells ──
  // Ưu tiên hot.getSelected() (live); fallback về lastSelectionRef khi toolbar click làm mất focus
  const getSelectedCells = useCallback((): Array<{ row: number; col: number }> => {
    const hot = hotRef.current?.hotInstance;
    const liveSelected = hot?.getSelected();
    const selected = (liveSelected?.length ? liveSelected : lastSelectionRef.current) as [number, number, number, number][] | null;
    if (!selected?.length) return [];
    const cells: Array<{ row: number; col: number }> = [];
    for (const [r1, c1, r2, c2] of selected) {
      for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
        for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }, []);

  // ── Apply style to selection ──
  // Updates ref directly, then triggers a hot.render() to repaint cells.
  const applyStyleToSelection = useCallback((patch: Partial<CellStyle>) => {
    const cells = getSelectedCells();
    if (cells.length === 0) {
      toast.info(t('preview.selectCellFirst'));
      return;
    }

    const si = activeSheetIndexRef.current;
    for (const { row, col } of cells) {
      const key = sk(si, row, col);
      stylesRef.current[key] = { ...(stylesRef.current[key] || {}), ...patch };
    }

    // Force Handsontable to repaint all visible cells
    hotRef.current?.hotInstance?.render();
    // Also bump version so React re-renders toolbar highlights
    setStyleVersion(v => v + 1);
    setIsModified(true);
  }, [getSelectedCells]);

  // ── Toggle boolean style ──
  const toggleStyle = useCallback((prop: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    const cells = getSelectedCells();
    if (cells.length === 0) {
      toast.info(t('preview.selectCellFirst'));
      return;
    }
    const si = activeSheetIndexRef.current;
    const allOn = cells.every(c => stylesRef.current[sk(si, c.row, c.col)]?.[prop]);
    applyStyleToSelection({ [prop]: !allOn });
  }, [getSelectedCells, applyStyleToSelection]);

  // ── Get style of active cell (for toolbar highlights) ──
  // Đọc từ stylesRef + selectedRowRef/ColRef — không dùng state selectedRow/Col
  const getActiveCellStyle = (): CellStyle => {
    const r = selectedRowRef.current;
    const c = selectedColRef.current;
    if (r === null || c === null) return {};
    return stylesRef.current[sk(activeSheetIndexRef.current, r, c)] || {};
  };
  // styleVersion chỉ bump khi apply style → đọc lại activeStyle
  const activeStyle = getActiveCellStyle();

  // ── Sync current sheet data before switching tab ──
  const syncCurrentSheetData = useCallback(() => {
    const hot = hotRef.current?.hotInstance;
    const si = activeSheetIndexRef.current;
    if (hot && sheetsRef.current[si]) {
      sheetsRef.current[si] = {
        ...sheetsRef.current[si],
        data: hot.getData(),
      };
      // Snapshot merge cells của sheet active hiện tại vào ref — giữ lại khi switch sheet
      const mcPlugin = hot.getPlugin('MergeCells') as any;
      const currentMerges = mcPlugin?.mergedCellsCollection?.mergedCells?.map?.((m: any) => ({
        row: m.row, col: m.col, rowspan: m.rowspan, colspan: m.colspan,
      })) ?? [];
      if (currentMerges.length > 0) {
        mergeCellsBySheetRef.current[si] = currentMerges;
      } else {
        delete mergeCellsBySheetRef.current[si];
      }
    }
  }, []);

  // ── Switch sheet ──
  const handleSheetTabChange = useCallback((newIndex: number) => {
    syncCurrentSheetData();
    setActiveSheetIndex(newIndex);
    activeSheetIndexRef.current = newIndex;
    // Trigger re-render so new sheet's styles are applied
    setStyleVersion(v => v + 1);
  }, [syncCurrentSheetData]);

  // ── Add sheet ──
  const addNewSheet = useCallback(() => {
    syncCurrentSheetData();
    const newSheet: SheetData = {
      name: `Sheet${sheetsRef.current.length + 1}`,
      colHeaders: ['A', 'B', 'C', 'D', 'E'],
      data: Array.from({ length: 10 }, () => Array(5).fill(null)),
    };
    const newSheets = [...sheetsRef.current, newSheet];
    sheetsRef.current = newSheets;
    setSheets([...newSheets]);
    const newIdx = newSheets.length - 1;
    setActiveSheetIndex(newIdx);
    activeSheetIndexRef.current = newIdx;
    setIsModified(true);
  }, [syncCurrentSheetData]);

  // ── Rename sheet tab ──
  const commitTabRename = useCallback(() => {
    if (editingTabIndex === null) return;
    const trimmed = editingTabName.trim();
    if (trimmed && trimmed !== sheetsRef.current[editingTabIndex]?.name) {
      sheetsRef.current[editingTabIndex] = { ...sheetsRef.current[editingTabIndex], name: trimmed };
      setSheets([...sheetsRef.current]);
      setIsModified(true);
    }
    setEditingTabIndex(null);
  }, [editingTabIndex, editingTabName]);

  // ── Delete sheet ──
  const deleteSheet = useCallback((index: number) => {
    if (sheetsRef.current.length <= 1) return;
    syncCurrentSheetData();
    const newSheets = sheetsRef.current.filter((_, i) => i !== index);
    sheetsRef.current = newSheets;

    // Re-key styles for sheets that shifted
    const newStyles: StylesStore = {};
    for (const [key, val] of Object.entries(stylesRef.current)) {
      const [si, row, col] = key.split(':').map(Number);
      if (si === index) continue; // deleted sheet
      const newSi = si > index ? si - 1 : si;
      newStyles[sk(newSi, row, col)] = val;
    }
    stylesRef.current = newStyles;

    setSheets([...newSheets]);
    setActiveSheetIndex(prev => {
      const newIdx = prev >= newSheets.length ? newSheets.length - 1 : prev > index ? prev - 1 : prev;
      activeSheetIndexRef.current = newIdx;
      return newIdx;
    });
    setIsModified(true);
  }, [syncCurrentSheetData]);

  // ── Save ──
  const buildFileBuffer = async (): Promise<{ buffer: ArrayBuffer; fileMimeType: string }> => {
    let buffer: ArrayBuffer;
    let fileMimeType: string;

    if (mimeType === 'text/csv') {
      const wb = XLSX.utils.book_new();
      for (const sheet of sheetsRef.current) {
        const ws = XLSX.utils.aoa_to_sheet([sheet.colHeaders, ...sheet.data]);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      }
      buffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
      fileMimeType = 'text/csv';
    } else {
      const workbook = new ExcelJS.Workbook();
      // syncCurrentSheetData() đã cập nhật mergeCellsBySheetRef cho sheet active.
      // Các sheet khác giữ merge trạng thái đã snapshot từ lúc switch hoặc load.

      for (let si = 0; si < sheetsRef.current.length; si++) {
        const sheet = sheetsRef.current[si];
        const ws = workbook.addWorksheet(sheet.name);
        ws.addRow(sheet.colHeaders).font = { bold: true };

        for (let ri = 0; ri < sheet.data.length; ri++) {
          const wsRow = ws.addRow(sheet.data[ri]);
          for (let ci = 0; ci < (sheet.data[ri]?.length || 0); ci++) {
            const style = stylesRef.current[sk(si, ri, ci)];
            if (!style) continue;
            const cell = wsRow.getCell(ci + 1);
            if (style.bold || style.italic || style.underline || style.strikethrough || style.textColor || style.fontSize || style.fontFamily) {
              cell.font = {
                bold: style.bold, italic: style.italic,
                underline: style.underline ? 'single' : undefined,
                strike: style.strikethrough,
                color: style.textColor ? { argb: `FF${style.textColor.replace('#', '')}` } : undefined,
                size: style.fontSize, name: style.fontFamily,
              };
            }
            if (style.bgColor) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${style.bgColor.replace('#', '')}` } };
            }
            if (style.align || style.wordWrap) {
              cell.alignment = { horizontal: style.align, wrapText: style.wordWrap || undefined };
            }
            if (style.numberFormat === 'currency') cell.numFmt = '#,##0 "₫"';
            else if (style.numberFormat === 'percent') cell.numFmt = '0.00%';
            else if (style.numberFormat === 'date') cell.numFmt = 'dd/mm/yyyy';
            else if (style.numberFormat === 'number') cell.numFmt = '#,##0';

            // Borders — persist qua ExcelJS. data[ri] nằm ở row (ri+2) trong ExcelJS (header = row 1)
            if (style.borderAll || style.borderOutline || style.borderThick) {
              const borderStyle: ExcelJS.BorderStyle = style.borderThick ? 'medium' : 'thin';
              const border: Partial<ExcelJS.Borders> = {
                top: { style: borderStyle },
                left: { style: borderStyle },
                bottom: { style: borderStyle },
                right: { style: borderStyle },
              };
              cell.border = border;
            }
          }
        }

        // Merge cells — dùng snapshot per-sheet
        const sheetMerges = mergeCellsBySheetRef.current[si] ?? [];
        for (const m of sheetMerges) {
          // Handsontable row index = data row index (0-based). Excel row = ri + 2 (header + 1-indexed).
          // m.col 0-based. Excel col = m.col + 1.
          const startRow = m.row + 2;
          const startCol = m.col + 1;
          const endRow = m.row + m.rowspan - 1 + 2;
          const endCol = m.col + m.colspan - 1 + 1;
          try {
            ws.mergeCells(startRow, startCol, endRow, endCol);
          } catch (e) {
            console.warn('Merge persist failed', m, e);
          }
        }
      }
      const buf = await workbook.xlsx.writeBuffer();
      buffer = buf instanceof ArrayBuffer ? buf : new Uint8Array(buf as any).buffer;
      fileMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    return { buffer, fileMimeType };
  };

  const handleSave = async () => {
    if (!canEdit || isSaving) return;
    syncCurrentSheetData();

    if (onSaveFile) {
      // Public page flow: save trực tiếp, không dialog
      setIsSaving(true);
      try {
        const { buffer, fileMimeType } = await buildFileBuffer();
        const file = new File([buffer], fileName, { type: fileMimeType });
        await onSaveFile(file);
        setIsModified(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.error?.message || err?.message || t('preview.saveError'));
        console.error('Save error:', err);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Normal flow: hiện dialog để nhập change note
      setShowSaveDialog(true);
    }
  };

  const handleSaveWithNote = async (changeNote?: string) => {
    if (!canEdit || isSaving) return;
    syncCurrentSheetData();
    setIsSaving(true);
    try {
      const { buffer, fileMimeType } = await buildFileBuffer();
      const file = new File([buffer], fileName, { type: fileMimeType });
      await updateDocumentFile(documentId, file, changeNote);
      setIsModified(false);
      setShowSaveDialog(false);
      toast.success(t('preview.saveSuccess'));
      // Notify parent để re-fetch document — cập nhật extractionStatus sang PROCESSING
      onDocumentSaved?.().catch(() => {});
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || t('preview.saveError'));
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── HotTable callbacks — memoize để tránh re-render → HotTable.updateSettings() → lag ───
  // Mọi state update (setFormulaBarValue, setSelectedCellRef...) sẽ khiến parent re-render.
  // Nếu callback được tạo mới mỗi render, HotTable coi như config thay đổi → re-apply tốn kém.
  const cellsConfig = useMemo(() => ({ renderer: cellRenderer as any }), [cellRenderer]);
  const cellsCb = useCallback(() => cellsConfig, [cellsConfig]);

  const onAfterSelectionEnd = useCallback((row: number, col: number) => {
    selectedRowRef.current = row;
    selectedColRef.current = col;
    const hot = hotRef.current?.hotInstance;
    if (hot) {
      const sel = hot.getSelected();
      if (sel) lastSelectionRef.current = sel as [number, number, number, number][];
      const val = hot.getDataAtCell(row, col);
      setFormulaBarValue(val != null ? String(val) : '');
    }
    setSelectedCellRef(`${colToLetter(col)}${row + 1}`);
  }, []);

  const onAfterChange = useCallback((changes: any[] | null, source: string) => {
    if (source !== 'loadData' && changes?.length) {
      setIsModified(true);
      const r = selectedRowRef.current;
      const c = selectedColRef.current;
      if (r !== null && c !== null) {
        const changed = changes.find(([cr, cc]: any[]) => cr === r && cc === c);
        if (changed) setFormulaBarValue(changed[3] != null ? String(changed[3]) : '');
      }
    }
  }, []);

  const onAfterCreateRow = useCallback(() => setIsModified(true), []);
  const onAfterRemoveRow = useCallback(() => setIsModified(true), []);
  const onAfterCreateCol = useCallback(() => setIsModified(true), []);
  const onAfterRemoveCol = useCallback(() => setIsModified(true), []);

  // ─── Render guards ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="space-y-4 w-full max-w-6xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{t('preview.loadingSheet')}</span>
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={() => window.open(url, '_blank')} variant="outline">
            <Download className="h-4 w-4 mr-2" />{t('preview.download')}
          </Button>
        </div>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">{t('preview.emptyFile')}</p>
      </div>
    );
  }

  const activeSheet = sheets[activeSheetIndex];
  const tabsHeight = 45;
  const toolbarHeight = canEdit ? 130 : 50;
  const hotHeight = Math.max(200, containerHeight - toolbarHeight - tabsHeight);
  // Memoize merge cells prop — reference ổn định để HotTable không updateSettings vô cớ
  const mergeCellsProp = mergeCellsBySheetRef.current[activeSheetIndex] ?? true;

  // ── JSX ──
  return (
    <div ref={wrapperRef} className="h-full flex flex-col">

      {/* ═══ TOOLBAR ═══ */}
      <div className="border-b shrink-0">

        {/* Row 1: status + save */}
        <div className="flex items-center justify-between gap-4 px-4 py-1.5 border-b">
          <div className="flex items-center gap-2">
            {!canEdit && !userHasEditPermission && <Badge variant="secondary" className="text-xs">{t('preview.readOnly')}</Badge>}
            {isLargeFile && (
              <Alert className="py-1 px-2 text-xs border-yellow-400">
                <Info className="h-3 w-3" />
                <AlertDescription className="text-xs ml-1">File lớn, có thể chậm khi lưu</AlertDescription>
              </Alert>
            )}
          </div>
          {canEdit && isModified && (
            <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? t('preview.saving') : t('preview.saveShortcut')}
            </Button>
          )}
        </div>

        {/* Row 2: Formula Bar */}
        <div className="flex items-center gap-1 px-3 py-1 border-b">
          <div className="w-16 h-7 border rounded px-2 flex items-center justify-center bg-muted font-mono text-xs text-center shrink-0">
            {selectedCellRef || ''}
          </div>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <input
            className="flex-1 h-7 border rounded px-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            value={formulaBarValue}
            placeholder="Nội dung ô..."
            readOnly={!canEdit}
            onChange={(e) => setFormulaBarValue(e.target.value)}
            onBlur={() => {
              const r = selectedRowRef.current;
              const c = selectedColRef.current;
              if (canEdit && r !== null && c !== null) {
                hotRef.current?.hotInstance?.setDataAtCell(r, c, formulaBarValue);
                setIsModified(true);
              }
            }}
            onKeyDown={(e) => {
              const r = selectedRowRef.current;
              const c = selectedColRef.current;
              if (e.key === 'Enter' && canEdit && r !== null && c !== null) {
                hotRef.current?.hotInstance?.setDataAtCell(r, c, formulaBarValue);
                setIsModified(true);
                e.currentTarget.blur();
              }
            }}
          />
        </div>

        {/* Row 3: Clipboard + Font + Colors + Alignment + Word wrap */}
        {/* onMouseDown + preventDefault: ngăn toolbar steal focus khỏi Handsontable */}
        {canEdit && (
          <div
            className="flex items-center gap-1 px-3 py-1 flex-wrap border-b"
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* Font size */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" title="Cỡ chữ">
                  <Type className="h-4 w-4" />
                  <span className="text-xs">{activeStyle.fontSize ?? 11}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {[8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map((sz) => (
                  <DropdownMenuItem key={sz} onClick={() => applyStyleToSelection({ fontSize: sz })}>
                    <span className={activeStyle.fontSize === sz ? 'font-semibold' : ''}>{sz} pt</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text formatting */}
            <Button variant={activeStyle.bold ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 font-bold" onClick={() => toggleStyle('bold')} title="In đậm (Ctrl+B)"><Bold className="h-4 w-4" /></Button>
            <Button variant={activeStyle.italic ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 italic" onClick={() => toggleStyle('italic')} title="In nghiêng (Ctrl+I)"><Italic className="h-4 w-4" /></Button>
            <Button variant={activeStyle.underline ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => toggleStyle('underline')} title="Gạch chân (Ctrl+U)"><Underline className="h-4 w-4" /></Button>
            <Button variant={activeStyle.strikethrough ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => toggleStyle('strikethrough')} title="Gạch ngang"><Strikethrough className="h-4 w-4" /></Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <Button variant={activeStyle.align === 'left' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => applyStyleToSelection({ align: 'left' })} title="Căn trái"><AlignLeft className="h-4 w-4" /></Button>
            <Button variant={activeStyle.align === 'center' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => applyStyleToSelection({ align: 'center' })} title="Căn giữa"><AlignCenter className="h-4 w-4" /></Button>
            <Button variant={activeStyle.align === 'right' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => applyStyleToSelection({ align: 'right' })} title="Căn phải"><AlignRight className="h-4 w-4" /></Button>
          </div>
        )}
      </div>

      {/* ═══ SPREADSHEET ═══ */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <HotTable
          ref={hotRef}
          key={`sheet-${activeSheetIndex}`}
          data={activeSheet.data}
          colHeaders={activeSheet.colHeaders}
          rowHeaders={true}
          readOnly={!canEdit}
          licenseKey="non-commercial-and-evaluation"
          height={hotHeight}
          width="100%"
          stretchH="last"
          manualColumnResize={true}
          manualRowResize={true}
          autoWrapRow={true}
          autoWrapCol={true}
          mergeCells={mergeCellsProp}
          undo={true}
          fixedRowsTop={0}
          fixedColumnsStart={0}
          renderAllRows={false}
          viewportRowRenderingOffset="auto"
          cells={cellsCb}
          afterSelectionEnd={onAfterSelectionEnd}
          contextMenu={false}
          afterChange={onAfterChange}
          afterCreateRow={onAfterCreateRow}
          afterRemoveRow={onAfterRemoveRow}
          afterCreateCol={onAfterCreateCol}
          afterRemoveCol={onAfterRemoveCol}
          className="spreadsheet-editor"
        />


      </div>

      {/* ═══ SHEET TABS ═══ */}
      <div className="flex items-center gap-1 px-4 py-2 border-t shrink-0 overflow-x-auto">
        {sheets.map((sheet, index) => (
          <div key={`${sheet.name}-${index}`} className="group relative flex items-center shrink-0">
            {editingTabIndex === index ? (
              <input autoFocus value={editingTabName} onChange={e => setEditingTabName(e.target.value)}
                onBlur={() => commitTabRename()}
                onKeyDown={e => { if (e.key === 'Enter') commitTabRename(); if (e.key === 'Escape') setEditingTabIndex(null); }}
                className="px-2 py-1 text-sm border rounded w-24 focus:outline-none focus:ring-1 focus:ring-ring" />
            ) : (
              <button
                onClick={() => handleSheetTabChange(index)}
                onDoubleClick={() => { if (canEdit) { setEditingTabIndex(index); setEditingTabName(sheet.name); } }}
                className={`px-3 py-1 text-sm rounded border transition-colors flex items-center gap-1 ${
                  index === activeSheetIndex
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-muted'
                }`}
              >
                {sheet.name}
                {canEdit && sheets.length > 1 && (
                  <span role="button" tabIndex={-1}
                    onClick={e => { e.stopPropagation(); deleteSheet(index); }}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity cursor-pointer"
                    title="Xóa sheet">
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
        {canEdit && (
          <Button variant="ghost" size="icon" className="h-7 w-7 border border-dashed shrink-0" onClick={addNewSheet} title="Thêm sheet mới">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Save with note dialog */}
      <SaveWithNoteDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onConfirm={handleSaveWithNote}
        isSaving={isSaving}
      />
    </div>
  );
}
