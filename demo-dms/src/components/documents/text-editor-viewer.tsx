'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { Save, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { saveDocumentContent } from '@/lib/documents-api';
import { SaveWithNoteDialog } from './save-with-note-dialog';

interface TextEditorViewerProps {
  url: string;
  fileName: string;
  mimeType: string;
  documentId: string;
  canEdit: boolean; // true = EDITOR+, false = VIEWER
  /** True nếu user thực sự có quyền EDITOR/OWNER (dù đang ở preview mode).
   *  Khi true VÀ canEdit=false (preview mode), KHÔNG hiển thị badge "Chỉ xem" để tránh gây nhầm lẫn.
   *  refs bug #143
   */
  userHasEditPermission?: boolean;
  /** Optional callback cho public page — nếu không truyền sẽ dùng saveDocumentContent (authenticated) */
  onSaveContent?: (content: string) => Promise<void>;
  /** Callback sau khi save thành công — dùng để notify parent re-fetch document (cập nhật extractionStatus) */
  onDocumentSaved?: () => Promise<void>;
  /** Text cần highlight trong editor (substring match) */
  highlightText?: string | null;
}

/**
 * Text editor using Monaco Editor (VS Code engine)
 * EDITOR+ có thể save, VIEWER read-only
 */
export function TextEditorViewer({
  url,
  fileName,
  mimeType,
  documentId,
  canEdit,
  userHasEditPermission,
  onSaveContent,
  onDocumentSaved,
  highlightText,
}: TextEditorViewerProps) {
  const t = useTranslations('documents');
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  // Ref lưu monaco editor instance để dùng cho highlight
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // Fetch file content
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setOriginalContent(text);
        setIsModified(false);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Text file fetch error:', err);
        setError(t('preview.loadingContent'));
        setLoading(false);
      });
  }, [url]);

  // Keyboard shortcut: Ctrl+S → save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (canEdit && isModified && !isSaving) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canEdit, isModified, isSaving, content]);

  // Highlight text trong Monaco sau khi content load xong
  useEffect(() => {
    if (!highlightText || !editorRef.current || loading) return;

    const timer = setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      // Lấy 100 chars đầu để tìm kiếm
      const searchText = highlightText.slice(0, 100);
      const matches = model.findMatches(searchText, true, false, false, null, true);

      if (matches.length > 0) {
        // Áp dụng decoration highlight vàng
        editor.deltaDecorations(
          [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          matches.map((m: any) => ({
            range: m.range,
            options: {
              inlineClassName: 'highlight-citation-match',
              isWholeLine: false,
            },
          })),
        );
        // Scroll tới match đầu tiên
        editor.revealLineInCenter(matches[0].range.startLineNumber);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [highlightText, loading]);

  const handleSave = async () => {
    if (onSaveContent) {
      // Public page flow: save trực tiếp, không dialog
      setIsSaving(true);
      try {
        await onSaveContent(content);
        setOriginalContent(content);
        setIsModified(false);
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.message || 'Lưu thất bại';
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Normal flow: hiện dialog để nhập change note
      setShowSaveDialog(true);
    }
  };

  const handleSaveWithNote = async (changeNote?: string) => {
    setIsSaving(true);
    try {
      await saveDocumentContent(documentId, content, changeNote);
      toast.success(t('preview.save'));
      setOriginalContent(content);
      setIsModified(false);
      setShowSaveDialog(false);
      // Notify parent để re-fetch document — cập nhật extractionStatus sang PROCESSING
      onDocumentSaved?.().catch(() => {});
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || t('preview.saveError');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    setIsModified(newContent !== originalContent);
  };

  // Detect language từ file extension
  const getLanguage = (): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      txt: 'plaintext',
      csv: 'plaintext',
      json: 'json',
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      xml: 'xml',
      sql: 'sql',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      py: 'python',
      sh: 'shell',
      env: 'plaintext',
      log: 'plaintext',
    };
    return languageMap[ext] || 'plaintext';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="space-y-4 w-full max-w-4xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{t('preview.loadingContent')}</span>
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

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {!canEdit && !userHasEditPermission && <Badge variant="secondary">{t('preview.readOnly')}</Badge>}
          {isModified && canEdit && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {t('preview.unsavedChanges')}
            </Badge>
          )}
        </div>
        {canEdit && isModified && (
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t('preview.saving') : t('preview.saveChanges')}
          </Button>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <style>{`
          .highlight-citation-match {
            background-color: rgba(250, 204, 21, 0.4) !important;
            border-radius: 2px;
          }
        `}</style>
        <Editor
          height="100%"
          language={getLanguage()}
          value={content}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            readOnly: !canEdit,
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
          theme="vs-light"
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        />
      </div>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('saveWithNote.unsavedWarningTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('saveWithNote.unsavedWarningDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('saveWithNote.cancelButton')}</AlertDialogCancel>
            <AlertDialogAction>{t('saveWithNote.leaveButton')}</AlertDialogAction>
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
    </div>
  );
}
