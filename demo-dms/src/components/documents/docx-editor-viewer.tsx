'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import mammoth from 'mammoth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table as TableIcon,
  Link as LinkIcon,
  Unlink,
  Highlighter,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Quote,
  Minus,
  Image as ImageIcon,
  Undo,
  Redo,
  Save,
  AlertCircle,
  Download,
} from 'lucide-react';
import { updateDocumentFile } from '@/lib/documents-api';
import { SaveWithNoteDialog } from './save-with-note-dialog';

/**
 * Parse HTML từ Tiptap editor thành docx Paragraph/TextRun elements
 * Hỗ trợ: p, h1-h3, strong, em, u, ul, ol, br, table
 * Fallback: tạo Paragraph đơn giản với raw text nếu parse thất bại
 */
function parseTiptapHtmlToDocxChildren(html: string): Paragraph[] {
  if (!html || html.trim() === '') {
    return [new Paragraph({ children: [new TextRun('')] })];
  }

  try {
    // Parse HTML bằng DOMParser (chỉ có trong browser)
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.querySelector('div');
    if (!root) throw new Error('Parse failed');

    const paragraphs: Paragraph[] = [];

    function getAlignmentType(el: Element): typeof AlignmentType[keyof typeof AlignmentType] | undefined {
      const style = (el as HTMLElement).style?.textAlign;
      const textAlign = style || el.getAttribute('data-text-align') || '';
      if (textAlign === 'center') return AlignmentType.CENTER;
      if (textAlign === 'right') return AlignmentType.RIGHT;
      if (textAlign === 'justify') return AlignmentType.JUSTIFIED;
      return undefined;
    }

    /**
     * Parse thẻ <img> thành ImageRun cho docx.
     * Hỗ trợ src dạng data URI: "data:image/png;base64,..."
     * Trả về null nếu src không hợp lệ hoặc không phải data URI.
     */
    function parseImgElementToImageRun(el: Element): ImageRun | null {
      const src = el.getAttribute('src') || '';
      const dataUriMatch = src.match(/^data:image\/(png|jpeg|jpg|gif|bmp);base64,(.+)$/i);
      if (!dataUriMatch) return null;

      const rawType = dataUriMatch[1].toLowerCase();
      const base64Data = dataUriMatch[2];
      // docx ImageRun type chỉ nhận "jpg" | "png" | "gif" | "bmp"
      const type = rawType === 'jpeg' ? 'jpg' : rawType as 'png' | 'jpg' | 'gif' | 'bmp';

      // Lấy width/height từ attribute hoặc style; fallback về kích thước mặc định
      const attrWidth = parseInt(el.getAttribute('width') || '0', 10);
      const attrHeight = parseInt(el.getAttribute('height') || '0', 10);
      // EMU (English Metric Units): 1 px ≈ 9525 EMU; dùng pt (1pt = 12700 EMU) cho đơn giản
      // docx transformation nhận đơn vị px tương đương (thư viện tự convert)
      const width = attrWidth > 0 ? attrWidth : 400;
      const height = attrHeight > 0 ? attrHeight : 300;

      try {
        return new ImageRun({
          type,
          data: base64Data,
          transformation: { width, height },
        });
      } catch {
        return null;
      }
    }

    function getTextRunsFromNode(node: Node, opts: {
      bold?: boolean;
      italics?: boolean;
      underline?: boolean;
      strike?: boolean;
    } = {}): TextRun[] {
      const runs: TextRun[] = [];

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          runs.push(new TextRun({
            text,
            bold: opts.bold,
            italics: opts.italics,
            underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
            strike: opts.strike,
          }));
        }
        return runs;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return runs;

      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      // Xử lý inline elements
      if (tagName === 'br') {
        runs.push(new TextRun({ break: 1 }));
        return runs;
      }

      // Xử lý ảnh inline trong paragraph
      if (tagName === 'img') {
        const imageRun = parseImgElementToImageRun(el);
        if (imageRun) (runs as any[]).push(imageRun);
        return runs;
      }

      const newOpts = { ...opts };
      if (tagName === 'strong' || tagName === 'b') newOpts.bold = true;
      if (tagName === 'em' || tagName === 'i') newOpts.italics = true;
      if (tagName === 'u') newOpts.underline = true;
      if (tagName === 's' || tagName === 'strike') newOpts.strike = true;

      for (const child of Array.from(el.childNodes)) {
        runs.push(...getTextRunsFromNode(child, newOpts));
      }

      return runs;
    }

    function processNode(node: Node): void {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      if (tagName === 'p') {
        const runs = getTextRunsFromNode(el);
        paragraphs.push(new Paragraph({
          children: runs.length > 0 ? runs : [new TextRun('')],
          alignment: getAlignmentType(el),
        }));
        return;
      }

      if (tagName === 'h1') {
        const runs = getTextRunsFromNode(el, { bold: true });
        paragraphs.push(new Paragraph({
          children: runs,
          heading: HeadingLevel.HEADING_1,
          alignment: getAlignmentType(el),
        }));
        return;
      }

      if (tagName === 'h2') {
        const runs = getTextRunsFromNode(el, { bold: true });
        paragraphs.push(new Paragraph({
          children: runs,
          heading: HeadingLevel.HEADING_2,
          alignment: getAlignmentType(el),
        }));
        return;
      }

      if (tagName === 'h3') {
        const runs = getTextRunsFromNode(el, { bold: true });
        paragraphs.push(new Paragraph({
          children: runs,
          heading: HeadingLevel.HEADING_3,
          alignment: getAlignmentType(el),
        }));
        return;
      }

      if (tagName === 'ul') {
        for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
          const runs = getTextRunsFromNode(li);
          paragraphs.push(new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun('')],
            bullet: { level: 0 },
          }));
        }
        return;
      }

      if (tagName === 'ol') {
        for (const li of Array.from(el.querySelectorAll(':scope > li'))) {
          const runs = getTextRunsFromNode(li);
          paragraphs.push(new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun('')],
            numbering: { reference: 'default-numbering', level: 0 },
          }));
        }
        return;
      }

      if (tagName === 'table') {
        // Tạo bảng docx từ HTML table
        const tableRows: DocxTableRow[] = [];
        const trElements = el.querySelectorAll('tr');
        trElements.forEach((tr) => {
          const cells: DocxTableCell[] = [];
          const tdElements = tr.querySelectorAll('th, td');
          tdElements.forEach((td) => {
            const isHeader = td.tagName.toLowerCase() === 'th';
            const runs = getTextRunsFromNode(td, { bold: isHeader });
            cells.push(new DocxTableCell({
              children: [new Paragraph({
                children: runs.length > 0 ? runs : [new TextRun('')],
              })],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }));
          });
          if (cells.length > 0) {
            tableRows.push(new DocxTableRow({ children: cells }));
          }
        });

        if (tableRows.length > 0) {
          // Thêm table vào paragraphs list (docx library dùng chung kiểu)
          // DocxTable implements ISectionOptions children interface
          (paragraphs as any[]).push(new DocxTable({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
        }
        return;
      }

      if (tagName === 'blockquote') {
        const runs = getTextRunsFromNode(el, { italics: true });
        paragraphs.push(new Paragraph({
          children: runs.length > 0 ? runs : [new TextRun('')],
          indent: { left: 720 },
        }));
        return;
      }

      // Xử lý ảnh độc lập (không nằm trong <p>) — TipTap đặt <img> trực tiếp trong editor root
      if (tagName === 'img') {
        const imageRun = parseImgElementToImageRun(el);
        if (imageRun) {
          paragraphs.push(new Paragraph({ children: [imageRun as any] }));
        }
        return;
      }

      // Xử lý children của node không phải block element đã biết
      for (const child of Array.from(el.childNodes)) {
        processNode(child);
      }
    }

    // Process tất cả children của root div
    for (const child of Array.from(root.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          paragraphs.push(new Paragraph({ children: [new TextRun(text)] }));
        }
      } else {
        processNode(child);
      }
    }

    if (paragraphs.length === 0) {
      return [new Paragraph({ children: [new TextRun('')] })];
    }

    return paragraphs;
  } catch (err) {
    console.error('HTML to docx parse error, using fallback:', err);
    // Fallback: strip HTML tags và tạo paragraph đơn giản
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return [new Paragraph({ children: [new TextRun(text)] })];
  }
}

interface DocxEditorViewerProps {
  url: string;
  fileName: string;
  documentId: string;
  canEdit: boolean;
  /** True nếu user thực sự có quyền EDITOR/OWNER (dù đang ở preview mode).
   *  Khi true VÀ canEdit=false (preview mode), KHÔNG hiển thị badge "Chỉ xem" để tránh gây nhầm lẫn.
   *  refs bug #143
   */
  userHasEditPermission?: boolean;
  /** Optional callback cho public page — nếu không truyền sẽ dùng updateDocumentFile (authenticated) */
  onSaveFile?: (file: File) => Promise<void>;
  /** Callback sau khi save thành công — dùng để notify parent re-fetch document (cập nhật extractionStatus) */
  onDocumentSaved?: () => Promise<void>;
  /** Text cần highlight trong DOCX viewer (substring match) */
  highlightText?: string | null;
}

/**
 * DOCX rich text editor/viewer dùng Tiptap
 * - EDITOR+: hiển thị toolbar, có Save button, Ctrl+S shortcut
 * - VIEWER: read-only, không toolbar, không save
 * - .doc binary cũ: hiển thị warning message
 */
export function DocxEditorViewer({
  url,
  fileName,
  documentId,
  canEdit,
  userHasEditPermission,
  onSaveFile,
  onDocumentSaved,
  highlightText,
}: DocxEditorViewerProps) {
  const t = useTranslations('documents');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialHtml, setInitialHtml] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showImageDialog, setShowImageDialog] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const isOldDocFormat =
    fileName.toLowerCase().endsWith('.doc') &&
    !fileName.toLowerCase().endsWith('.docx');

  const editor = useEditor({
    immediatelyRender: false,
    // TipTap v3 mặc định chỉ re-render khi doc thay đổi — KHÔNG re-render khi selection đổi.
    // Bật lại để toolbar state (pressed, disabled) phản ứng đúng với selection
    // (ví dụ: nút Unlink enable khi bôi đen text có link).
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ allowBase64: true, inline: true }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
      Placeholder.configure({
        placeholder: 'Bắt đầu soạn thảo...',
      }),
    ],
    content: initialHtml,
    editable: canEdit && !isOldDocFormat,
    onUpdate: ({ editor: e }) => {
      const currentHtml = e.getHTML();
      setIsModified(currentHtml !== initialHtml);
    },
  });

  // Load DOCX → HTML via mammoth
  useEffect(() => {
    if (isOldDocFormat) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(url)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) =>
        mammoth.convertToHtml(
          { arrayBuffer },
          {
            // Convert ảnh nhúng trong DOCX sang base64 data URI để hiển thị trong editor
            convertImage: mammoth.images.imgElement((image) =>
              image.read('base64').then((base64) => ({
                src: `data:${image.contentType};base64,${base64}`,
              }))
            ),
          }
        )
      )
      .then((result) => {
        const html = result.value || '<p></p>';
        setInitialHtml(html);
        setLoading(false);

        if (result.messages.length > 0) {
          console.warn('Mammoth conversion warnings:', result.messages);
        }
      })
      .catch((err: any) => {
        console.error('DOCX load error:', err);
        setError(t('preview.loadingDoc'));
        setLoading(false);
      });
  }, [url, fileName, isOldDocFormat]);

  // Set editor content khi initialHtml thay đổi.
  // Dùng `setMeta('addToHistory', false)` để transaction load nội dung KHÔNG bị đẩy vào
  // history stack của TipTap — nếu không, Ctrl+Z đầu tiên sẽ xóa sạch văn bản về rỗng
  // (revert setContent) và Redo sẽ không enable cho tới khi có undo.
  useEffect(() => {
    if (editor && initialHtml && !loading) {
      editor
        .chain()
        .setMeta('addToHistory', false)
        .setContent(initialHtml)
        .run();
      setIsModified(false);
    }
  }, [editor, initialHtml, loading]);

  // Sync editable state khi canEdit thay đổi (TipTap không tự cập nhật từ prop)
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(canEdit && !isOldDocFormat);
  }, [editor, canEdit, isOldDocFormat]);

  // Highlight text trong DOCX viewer sau khi content load xong
  useEffect(() => {
    if (!highlightText || !editor || loading) return;

    const timer = setTimeout(() => {
      // Approach: DOM manipulation trên .ProseMirror container
      // Tìm text nodes khớp và wrap trong <mark> với background vàng
      const proseMirror = document.querySelector('.tiptap-docx-editor .ProseMirror');
      if (!proseMirror) return;

      // Xóa highlight cũ nếu có
      const oldMarks = proseMirror.querySelectorAll('mark.citation-highlight');
      oldMarks.forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
          parent.normalize();
        }
      });

      // Tìm và highlight text mới (lấy 100 chars đầu)
      const searchText = highlightText.slice(0, 100).toLowerCase();
      if (!searchText) return;

      let firstMatchEl: Element | null = null;

      function highlightInNode(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          const lowerText = text.toLowerCase();
          const idx = lowerText.indexOf(searchText);
          if (idx === -1) return;

          // Split text node và insert <mark>
          const before = text.slice(0, idx);
          const match = text.slice(idx, idx + searchText.length);
          const after = text.slice(idx + searchText.length);

          const mark = document.createElement('mark');
          mark.className = 'citation-highlight';
          mark.style.backgroundColor = 'rgba(250, 204, 21, 0.4)';
          mark.style.borderRadius = '2px';
          mark.textContent = match;

          const parent = node.parentNode;
          if (!parent) return;

          const fragment = document.createDocumentFragment();
          if (before) fragment.appendChild(document.createTextNode(before));
          fragment.appendChild(mark);
          if (after) fragment.appendChild(document.createTextNode(after));

          parent.replaceChild(fragment, node);
          if (!firstMatchEl) firstMatchEl = mark;
          return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          // Không đi vào marks đã tạo để tránh infinite loop
          if ((node as Element).classList?.contains('citation-highlight')) return;
          // Iterate children (copy vì DOM thay đổi trong quá trình iterate)
          const children = Array.from(node.childNodes);
          for (const child of children) {
            highlightInNode(child);
            if (firstMatchEl) break; // Chỉ highlight match đầu tiên
          }
        }
      }

      highlightInNode(proseMirror);

      if (firstMatchEl) {
        (firstMatchEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400); // Đợi content render xong

    return () => clearTimeout(timer);
  }, [highlightText, editor, loading, initialHtml]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!editor || !isModified || isSaving) return;

    if (onSaveFile) {
      // Public page flow: save trực tiếp, không dialog
      setIsSaving(true);
      try {
        const html = editor.getHTML();
        const children = parseTiptapHtmlToDocxChildren(html);
        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: { top: 720, right: 720, bottom: 720, left: 720 },
                },
              },
              children,
            },
          ],
        });
        const docxBlob = await Packer.toBlob(doc);
        const docxFile = new File([docxBlob], fileName, {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        await onSaveFile(docxFile);
        setInitialHtml(html);
        setIsModified(false);
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.message || t('preview.saveError');
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Normal flow: hiện dialog để nhập change note
      setShowSaveDialog(true);
    }
  }, [editor, isModified, isSaving, fileName, onSaveFile, t]);

  const handleSaveWithNote = useCallback(async (changeNote?: string) => {
    if (!editor || isSaving) return;
    setIsSaving(true);
    try {
      const html = editor.getHTML();

      // Parse Tiptap HTML → docx elements (proper OOXML structure mammoth can re-read)
      const children = parseTiptapHtmlToDocxChildren(html);

      // Tạo Document với proper OOXML structure
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720,
                  right: 720,
                  bottom: 720,
                  left: 720,
                },
              },
            },
            children,
          },
        ],
      });

      // Convert Document → Blob (proper DOCX/OOXML format)
      const docxBlob = await Packer.toBlob(doc);

      // Tạo File object
      const docxFile = new File([docxBlob], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      await updateDocumentFile(documentId, docxFile, changeNote);

      // Update initial HTML để track changes tiếp theo
      setInitialHtml(html);
      setIsModified(false);
      setShowSaveDialog(false);
      toast.success(t('preview.saveSuccess'));
      // Notify parent để re-fetch document — cập nhật extractionStatus sang PROCESSING
      onDocumentSaved?.().catch(() => {});
    } catch (err: any) {
      console.error('Save error:', err);
      const msg =
        err?.response?.data?.error?.message || err?.message || t('preview.saveError');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }, [editor, isSaving, fileName, documentId]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    if (!canEdit) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, handleSave]);

  // ─── Image upload: file → base64 → insert vào editor ───
  // Dùng base64 vì Image extension đã bật allowBase64, không cần backend.
  // Limit 5MB/ảnh để file DOCX sau save không phình to quá.
  const insertImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh (PNG, JPG, GIF, WebP...)');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`Kích thước ảnh tối đa ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (!base64 || !editor) return;
        editor.chain().focus().setImage({ src: base64 }).run();
        setShowImageDialog(false);
      };
      reader.onerror = () => toast.error('Không thể đọc file ảnh');
      reader.readAsDataURL(file);
    },
    [editor, MAX_IMAGE_SIZE_BYTES]
  );

  const handleImageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // reset để có thể chọn lại cùng file
      if (file) insertImageFile(file);
    },
    [insertImageFile]
  );

  const handleImageDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) insertImageFile(file);
    },
    [insertImageFile]
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{t('preview.loadingDoc')}</span>
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  // .doc binary cũ — không hỗ trợ
  if (isOldDocFormat) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <p className="text-lg font-medium">
            {t('preview.docOldFormat')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('preview.docOldFormatHint')}
          </p>
          <Button onClick={() => window.open(url, '_blank')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('preview.download')}
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={() => window.open(url, '_blank')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('preview.download')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar — chỉ hiển thị khi canEdit */}
      {canEdit && editor && (
        <div className="border-b bg-muted/30 px-3 py-2 shrink-0">
          {/* Row 1: Text formatting */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Undo / Redo */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Làm lại (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Bold, Italic, Underline, Strike */}
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() =>
                editor.chain().focus().toggleBold().run()
              }
              title="Đậm (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() =>
                editor.chain().focus().toggleItalic().run()
              }
              title="Nghiêng (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('underline')}
              onPressedChange={() =>
                editor.chain().focus().toggleUnderline().run()
              }
              title="Gạch chân (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('strike')}
              onPressedChange={() =>
                editor.chain().focus().toggleStrike().run()
              }
              title="Gạch ngang"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('code')}
              onPressedChange={() =>
                editor.chain().focus().toggleCode().run()
              }
              title="Code (Ctrl+E)"
            >
              <Code className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('highlight')}
              onPressedChange={() =>
                editor.chain().focus().toggleHighlight().run()
              }
              title="Đánh dấu"
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('superscript')}
              onPressedChange={() =>
                editor.chain().focus().toggleSuperscript().run()
              }
              title="Chỉ số trên"
            >
              <SuperscriptIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('subscript')}
              onPressedChange={() =>
                editor.chain().focus().toggleSubscript().run()
              }
              title="Chỉ số dưới"
            >
              <SubscriptIcon className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Headings */}
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 1 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              title="Tiêu đề 1"
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 2 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Tiêu đề 2"
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 3 })}
              onPressedChange={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              title="Tiêu đề 3"
            >
              <Heading3 className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text alignment */}
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'left' })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign('left').run()
              }
              title="Căn trái"
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'center' })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign('center').run()
              }
              title="Căn giữa"
            >
              <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'right' })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign('right').run()
              }
              title="Căn phải"
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: 'justify' })}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign('justify').run()
              }
              title="Căn đều"
            >
              <AlignJustify className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists */}
            <Toggle
              size="sm"
              pressed={editor.isActive('bulletList')}
              onPressedChange={() =>
                editor.chain().focus().toggleBulletList().run()
              }
              title="Danh sách dấu chấm"
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('orderedList')}
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
              title="Danh sách đánh số"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('blockquote')}
              onPressedChange={() =>
                editor.chain().focus().toggleBlockquote().run()
              }
              title="Trích dẫn"
            >
              <Quote className="h-4 w-4" />
            </Toggle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Đường kẻ ngang"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Table */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              title="Chèn bảng"
            >
              <TableIcon className="h-4 w-4" />
            </Button>

            {/* Link */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${editor.isActive('link') ? 'bg-accent' : ''}`}
              onClick={() => {
                const previous = editor.getAttributes('link').href as string | undefined;
                const url = window.prompt('Nhập URL liên kết:', previous ?? '');
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              title="Chèn / sửa liên kết"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            {/* Unlink — chỉ enable khi selection đang có link */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
              disabled={!editor.isActive('link')}
              title="Bỏ liên kết"
            >
              <Unlink className="h-4 w-4" />
            </Button>

            {/* Image upload (dialog drag-drop) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowImageDialog(true)}
              title="Tải ảnh lên"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            {/* Save button */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isModified || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t('preview.saving') : t('preview.saveShortcut')}
            </Button>
          </div>
        </div>
      )}

      {/* VIEWER badge */}
      {!canEdit && !userHasEditPermission && (
        <div className="border-b px-4 py-2 shrink-0 flex items-center gap-2 bg-muted/20">
          <Badge variant="secondary">{t('preview.readOnly')}</Badge>
          <span className="text-xs text-muted-foreground">
            {t('preview.noEditPermission')}
          </span>
        </div>
      )}

      {/* Unsaved changes indicator */}
      {canEdit && isModified && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 shrink-0">
          <span className="text-xs text-amber-700">
            {t('preview.unsavedChangesHint')}
          </span>
        </div>
      )}

      {/* Editor content area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="max-w-4xl mx-auto p-8">
          <style>{`
            .tiptap-docx-editor .ProseMirror {
              font-family: 'Calibri', 'Arial', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              min-height: 400px;
              outline: none;
            }
            .tiptap-docx-editor .ProseMirror:focus {
              outline: none;
            }
            .tiptap-docx-editor .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: #adb5bd;
              pointer-events: none;
              height: 0;
            }
            .tiptap-docx-editor .ProseMirror h1 {
              font-size: 2rem;
              font-weight: 700;
              margin-top: 1.5rem;
              margin-bottom: 1rem;
            }
            .tiptap-docx-editor .ProseMirror h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin-top: 1.25rem;
              margin-bottom: 0.75rem;
            }
            .tiptap-docx-editor .ProseMirror h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }
            .tiptap-docx-editor .ProseMirror p {
              margin-bottom: 0.75rem;
            }
            .tiptap-docx-editor .ProseMirror strong {
              font-weight: 700;
            }
            .tiptap-docx-editor .ProseMirror em {
              font-style: italic;
            }
            /* Tailwind preflight reset list-style:none → phải khôi phục để dấu chấm / số hiện */
            .tiptap-docx-editor .ProseMirror ul {
              list-style-type: disc;
              margin-left: 1.5rem;
              margin-bottom: 0.75rem;
              padding-left: 1rem;
            }
            .tiptap-docx-editor .ProseMirror ol {
              list-style-type: decimal;
              margin-left: 1.5rem;
              margin-bottom: 0.75rem;
              padding-left: 1rem;
            }
            .tiptap-docx-editor .ProseMirror ul ul {
              list-style-type: circle;
            }
            .tiptap-docx-editor .ProseMirror ul ul ul {
              list-style-type: square;
            }
            .tiptap-docx-editor .ProseMirror li {
              margin-bottom: 0.25rem;
            }
            .tiptap-docx-editor .ProseMirror li > p {
              margin-bottom: 0;
            }
            .tiptap-docx-editor .ProseMirror table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            .tiptap-docx-editor .ProseMirror th,
            .tiptap-docx-editor .ProseMirror td {
              border: 1px solid #dee2e6;
              padding: 0.5rem;
              text-align: left;
            }
            .tiptap-docx-editor .ProseMirror th {
              background-color: #f8f9fa;
              font-weight: 600;
            }
            .tiptap-docx-editor .ProseMirror a {
              color: #0d6efd;
              text-decoration: underline;
              cursor: pointer;
            }
            .tiptap-docx-editor .ProseMirror blockquote {
              border-left: 4px solid #dee2e6;
              margin-left: 0;
              padding-left: 1rem;
              color: #6c757d;
            }
            .tiptap-docx-editor .ProseMirror code {
              background-color: #f8f9fa;
              padding: 0.1rem 0.3rem;
              border-radius: 3px;
              font-family: monospace;
              font-size: 0.875em;
            }
            .tiptap-docx-editor .ProseMirror pre {
              background-color: #f8f9fa;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
            }
            .tiptap-docx-editor .ProseMirror pre code {
              background: none;
              padding: 0;
            }
          `}</style>
          <div className="tiptap-docx-editor">
            <EditorContent editor={editor} />
          </div>
        </div>
      </ScrollArea>

      {/* Unsaved changes warning dialog */}
      <AlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saveWithNote.unsavedWarningTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('preview.unsavedSaveBeforeClose')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('saveWithNote.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              {t('preview.saveAndClose')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save with note dialog */}
      <SaveWithNoteDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onConfirm={handleSaveWithNote}
        isSaving={isSaving}
      />

      {/* Image upload dialog — click để chọn file hoặc kéo thả ảnh */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tải ảnh lên</DialogTitle>
            <DialogDescription>
              Click để chọn file hoặc kéo thả ảnh vào khung bên dưới. Tối đa{' '}
              {MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB mỗi ảnh.
            </DialogDescription>
          </DialogHeader>
          <div
            onClick={() => imageInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleImageDrop}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">
                <span className="underline">Click để tải lên</span> hoặc kéo thả
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP — tối đa{' '}
                {MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB
              </p>
            </div>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageInputChange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
