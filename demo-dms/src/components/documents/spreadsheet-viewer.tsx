'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as XLSX from 'xlsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SpreadsheetViewerProps {
  url: string;
  fileName: string;
  mimeType: string;
}

interface SheetData {
  name: string;
  rows: any[][]; // Array of rows, mỗi row là array of cells
}

const MAX_ROWS = 1000;
const MAX_COLS = 50;

/**
 * Spreadsheet viewer - XLSX/CSV preview using SheetJS
 */
export function SpreadsheetViewer({ url, fileName, mimeType }: SpreadsheetViewerProps) {
  const t = useTranslations('documents');
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState<{ rows: boolean; cols: boolean }>({
    rows: false,
    cols: false,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadSpreadsheet = async () => {
      try {
        let workbook: XLSX.WorkBook;

        if (mimeType === 'text/csv') {
          // CSV files: fetch as text
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          const csvText = await response.text();
          workbook = XLSX.read(csvText, { type: 'string' });
        } else {
          // Excel files: fetch as array buffer
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          const arrayBuffer = await response.arrayBuffer();
          workbook = XLSX.read(arrayBuffer, { type: 'array' });
        }

        // Parse all sheets
        const parsedSheets: SheetData[] = [];
        let hasRowTruncation = false;
        let hasColTruncation = false;

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          // Convert to JSON với header: 1 → trả raw rows (array of arrays)
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          // Truncate nếu vượt limit
          const truncatedRows = jsonData.slice(0, MAX_ROWS);
          if (jsonData.length > MAX_ROWS) hasRowTruncation = true;

          const truncatedData = truncatedRows.map((row) => {
            const truncatedRow = row.slice(0, MAX_COLS);
            if (row.length > MAX_COLS) hasColTruncation = true;
            return truncatedRow;
          });

          parsedSheets.push({
            name: sheetName,
            rows: truncatedData,
          });
        }

        setSheets(parsedSheets);
        setTruncated({ rows: hasRowTruncation, cols: hasColTruncation });
        setLoading(false);
      } catch (err: any) {
        console.error('Spreadsheet parsing error:', err);
        setError(t('preview.loadingSheet'));
        setLoading(false);
      }
    };

    loadSpreadsheet();
  }, [url, mimeType]);

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
            <Download className="h-4 w-4 mr-2" />
            {t('preview.download')}
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

  return (
    <div className="h-full flex flex-col">
      {/* Truncation warning */}
      {(truncated.rows || truncated.cols) && (
        <div className="p-4 border-b">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {truncated.rows && t('preview.truncatedRows', { count: MAX_ROWS })}
              {truncated.cols && t('preview.truncatedCols', { count: MAX_COLS })}
              {t('preview.downloadToViewFull')}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Tabs cho multiple sheets */}
      {sheets.length === 1 ? (
        // Single sheet: không cần tabs
        <ScrollArea className="flex-1">
          <div className="p-4">
            <SpreadsheetTable rows={sheets[0].rows} />
          </div>
        </ScrollArea>
      ) : (
        // Multiple sheets: dùng tabs
        <Tabs defaultValue={sheets[0].name} className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList className="h-10">
              {sheets.map((sheet) => (
                <TabsTrigger key={sheet.name} value={sheet.name} className="text-sm">
                  {sheet.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {sheets.map((sheet) => (
            <TabsContent key={sheet.name} value={sheet.name} className="flex-1 mt-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <SpreadsheetTable rows={sheet.rows} />
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

/**
 * Render table từ raw rows data
 */
function SpreadsheetTable({ rows }: { rows: any[][] }) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground">Sheet rỗng</p>;
  }

  // Row đầu tiên làm header
  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headerRow.map((cell, index) => (
            <TableHead key={index} className="font-bold bg-muted">
              {formatCell(cell)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataRows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {headerRow.map((_, colIndex) => {
              const cell = row[colIndex];
              return (
                <TableCell key={colIndex} className={getCellAlignment(cell)}>
                  {formatCell(cell)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Format cell value cho display
 */
function formatCell(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

/**
 * Detect cell alignment dựa trên type
 */
function getCellAlignment(value: any): string {
  if (typeof value === 'number') return 'text-right';
  return 'text-left';
}
