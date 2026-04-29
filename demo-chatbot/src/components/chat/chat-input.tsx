'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SendHorizontal, X, Plus, FileText, GitCompareArrows, ArrowLeftRight, Paperclip, Upload, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEditor, EditorContent, ReactRenderer, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MentionSuggestionList, type MentionSuggestionItem } from './mention-suggestion-list';
import { SlashCommandExtension, createSlashSuggestion } from './slash-command-extension';
import { commandToRequestType } from './slash-commands';
import { FileUploadPreview } from './file-upload-preview';
import { getMentionableDocuments } from '@/lib/chat-api';
import type { PendingFile } from '@/types/chat';

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.xlsx,.pptx,.txt,.png,.jpg,.jpeg,.webp';
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

// ─── Props ──────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (query: string, contextDocumentIds?: string[], contextDocumentNames?: string[], files?: File[], requestType?: string) => void;
  isStreaming: boolean;
  onCancel?: () => void;
  onSummarizeClick?: () => void;
  onDiffClick?: () => void;
  onCompareClick?: () => void;
  onTranslateClick?: () => void;
  /** Callback trả drag handlers để parent gắn drop zone rộng hơn */
  onDragHandlersReady?: (handlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  }) => void;
  /** Notify parent khi drag state thay đổi (để hiện overlay ở cấp layout) */
  onDraggingChange?: (isDragging: boolean) => void;
  /** Phase 65 — Text để pre-fill vào editor khi click suggestion card */
  prefillText?: string;
  /** Phase 65 — Callback sau khi pre-fill đã được consume (để clear state ở parent) */
  onPrefillConsumed?: () => void;
  /** Phase 68.1 — Callback khi chọn /new trong slash commands */
  onNewSession?: () => void;
  /** Issue #122 — Disable toàn bộ input khi phiên đạt giới hạn 50 tin nhắn */
  isSessionLimitReached?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ChatInput({
  onSend,
  isStreaming,
  onCancel,
  onSummarizeClick,
  onDiffClick,
  onCompareClick,
  onTranslateClick,
  onDragHandlersReady,
  onDraggingChange,
  prefillText,
  onPrefillConsumed,
  onNewSession,
  isSessionLimitReached = false,
}: ChatInputProps) {
  const t = useTranslations('chat');
  const [mentionedDocs, setMentionedDocs] = useState<Map<string, string>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionOpenCountRef = useRef(0);
  const handleSendRef = useRef<() => void>(() => {});

  // ─── File upload state ──────────────────────────────────────────────────
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // ─── File validation + add ──────────────────────────────────────────────

  const validateAndAddFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const currentCount = pendingFiles.length;

      if (currentCount + fileArray.length > MAX_FILES) {
        toast.error(t('upload.maxFiles'));
        return;
      }

      const validFiles: PendingFile[] = [];

      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: ${t('upload.fileTooLarge')}`);
          continue;
        }
        if (!ALLOWED_MIME_TYPES.has(file.type)) {
          toast.error(`${file.name}: ${t('upload.unsupportedFormat')}`);
          continue;
        }

        const localId = crypto.randomUUID();
        const isImage = file.type.startsWith('image/');

        validFiles.push({
          localId,
          file,
          preview: isImage ? URL.createObjectURL(file) : undefined,
          status: 'pending',
          progress: 0,
        });
      }

      if (validFiles.length === 0) return;

      // Chỉ lưu blob ở FE — KHÔNG upload lên server ngay
      // Upload sẽ xảy ra khi user bấm Gửi (trong sendMessage)
      setPendingFiles((prev) => [...prev, ...validFiles]);
    },
    [pendingFiles.length, t],
  );

  // ─── Remove pending file ────────────────────────────────────────────────

  const handleRemoveFile = useCallback((localId: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.localId === localId);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.localId !== localId);
    });
  }, []);

  // ─── Cleanup preview URLs on unmount ────────────────────────────────────

  useEffect(() => {
    return () => {
      pendingFiles.forEach((pf) => {
        if (pf.preview) URL.revokeObjectURL(pf.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Drag & drop handlers ──────────────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    },
    [validateAndAddFiles],
  );

  // ─── Expose drag handlers to parent (cho drop zone toàn bộ chat area) ──
  useEffect(() => {
    onDragHandlersReady?.({
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    });
  }, [onDragHandlersReady, handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  // Notify parent khi drag state thay đổi
  useEffect(() => {
    onDraggingChange?.(isDragging);
  }, [isDragging, onDraggingChange]);

  // ─── TipTap editor ─────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Placeholder.configure({
        placeholder: isStreaming ? t('input.placeholderStreaming') : 'Hỏi điều gì đó hoặc gõ / để xem các lệnh',
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-700 not-editable',
        },
        renderText({ node }) {
          return `@${node.attrs.label ?? node.attrs.id}`;
        },
        suggestion: {
          items: async ({ query }: { query: string }): Promise<MentionSuggestionItem[]> => {
            if (mentionedDocs.size >= 3) {
              toast.info('Tối đa 3 tài liệu được chọn mỗi tin nhắn');
              return [];
            }

            return new Promise((resolve) => {
              if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = setTimeout(
                async () => {
                  try {
                    const result = await getMentionableDocuments({
                      search: query || undefined,
                      limit: 10,
                    });
                    resolve(
                      result.data.map((doc) => ({
                        id: doc.id,
                        label: doc.fileName,
                        mimeType: doc.mimeType,
                      })),
                    );
                  } catch {
                    resolve([]);
                  }
                },
                query ? 300 : 0,
              );
            });
          },
          render: () => {
            let component: ReactRenderer | null = null;
            let popup: TippyInstance[] | null = null;
            return {
              onStart: (props: SuggestionProps) => {
                suggestionOpenCountRef.current += 1;
                component = new ReactRenderer(MentionSuggestionList, {
                  props,
                  editor: props.editor,
                });
                if (!props.clientRect) return;
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'top-start',
                });
              },
              onUpdate(props: SuggestionProps) {
                component?.updateProps(props);
                if (popup?.[0] && props.clientRect) {
                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                  });
                }
              },
              onKeyDown(props: SuggestionKeyDownProps) {
                if (props.event.key === 'Escape') {
                  popup?.[0]?.hide();
                  suggestionOpenCountRef.current = Math.max(0, suggestionOpenCountRef.current - 1);
                  return true;
                }
                if (props.event.key === 'Tab') {
                  props.event.preventDefault();
                }
                return (component?.ref as { onKeyDown?: (p: SuggestionKeyDownProps) => boolean })?.onKeyDown?.(props) ?? false;
              },
              onExit() {
                suggestionOpenCountRef.current = Math.max(0, suggestionOpenCountRef.current - 1);
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        },
      }),
      SlashCommandExtension.configure({
        suggestion: createSlashSuggestion({
          onNewSession: () => onNewSession?.(),
          onSuggestionOpen: () => { suggestionOpenCountRef.current += 1; },
          onSuggestionClose: () => { suggestionOpenCountRef.current = Math.max(0, suggestionOpenCountRef.current - 1); },
        }),
      }),
      // Custom extension: Enter to send (unless suggestion popup is open)
      Extension.create({
        name: 'enterToSend',
        addKeyboardShortcuts() {
          return {
            Enter: () => {
              if (suggestionOpenCountRef.current > 0) {
                return false;
              }
              handleSendRef.current();
              return true;
            },
          };
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[120px] overflow-y-auto px-3 py-2 text-sm',
      },
      // Paste handler: intercept image paste from clipboard (Ctrl+V)
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const imageFiles: File[] = [];
        for (let i = 0; i < clipboardData.files.length; i++) {
          const file = clipboardData.files[i];
          if (file.type.startsWith('image/') && ALLOWED_MIME_TYPES.has(file.type)) {
            imageFiles.push(file);
          }
        }

        if (imageFiles.length > 0) {
          event.preventDefault();
          validateAndAddFiles(imageFiles);
          return true;
        }

        // Không có image files → để TipTap xử lý paste text bình thường
        return false;
      },
    },
    onUpdate({ editor: ed }) {
      const mentions = new Map<string, string>();
      const traverse = (n: Record<string, unknown>) => {
        if (n.type === 'mention' && (n.attrs as Record<string, unknown>)?.id) {
          const attrs = n.attrs as Record<string, string>;
          mentions.set(attrs.id, attrs.label || '');
        }
        if (Array.isArray(n.content)) {
          (n.content as Record<string, unknown>[]).forEach(traverse);
        }
      };
      const json = ed.getJSON();
      if (Array.isArray(json.content)) {
        json.content.forEach((node) => traverse(node as Record<string, unknown>));
      }
      setMentionedDocs(mentions);
    },
    editable: !isStreaming && !isSessionLimitReached,
    immediatelyRender: false,
  });

  // Update editable state when isStreaming or isSessionLimitReached changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isStreaming && !isSessionLimitReached);
    }
  }, [editor, isStreaming, isSessionLimitReached]);

  // Phase 65 — Pre-fill từ suggestion card
  useEffect(() => {
    if (editor && prefillText) {
      editor.commands.setContent(prefillText);
      editor.commands.focus('end');
      onPrefillConsumed?.();
    }
  }, [editor, prefillText, onPrefillConsumed]);

  // ─── Send handler ───────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    if (!editor || isStreaming || isSessionLimitReached) return;

    // Extract text + mention info from TipTap JSON
    const json = editor.getJSON();
    const textParts: string[] = [];
    const docIds: string[] = [];
    const docNames: string[] = [];
    let detectedSlashCommand: string | null = null;

    const extractText = (nodes: Record<string, unknown>[]) => {
      for (const node of nodes) {
        if (node.type === 'text') {
          textParts.push((node.text as string) || '');
        } else if (node.type === 'mention') {
          const attrs = node.attrs as Record<string, string>;
          if (attrs?.id && !docIds.includes(attrs.id)) {
            docIds.push(attrs.id);
            docNames.push(attrs.label || '');
          }
          // Giữ tên file trong text query để AI biết user đang nói về file nào
          // Ví dụ: "tóm tắt @AA.txt" → query = "tóm tắt [AA.txt]"
          if (attrs?.label) {
            textParts.push(`[${attrs.label}]`);
          }
        } else if (node.type === 'slashCommand') {
          const attrs = node.attrs as { command: string; label: string };
          // Không push vào textParts — badge là intent marker, không phải text content
          // Lưu command để map sang requestType
          detectedSlashCommand = attrs.command;
        } else if (node.type === 'paragraph') {
          if (textParts.length > 0 && textParts[textParts.length - 1] !== '\n') {
            textParts.push('\n');
          }
          if (Array.isArray(node.content)) {
            extractText(node.content as Record<string, unknown>[]);
          }
        } else if (Array.isArray(node.content)) {
          extractText(node.content as Record<string, unknown>[]);
        }
      }
    };

    if (Array.isArray(json.content)) {
      extractText(json.content as Record<string, unknown>[]);
    }

    const query = textParts.join('').trim();

    // Collect File blobs từ pendingFiles
    const filesToUpload = pendingFiles.map((pf) => pf.file);

    if (!query && docIds.length === 0 && filesToUpload.length === 0 && !detectedSlashCommand) return;

    onSend(
      query || (filesToUpload.length > 0 ? 'Hãy phân tích nội dung các file đính kèm' : 'Hãy phân tích nội dung các tài liệu này'),
      docIds.length > 0 ? docIds : undefined,
      docNames.length > 0 ? docNames : undefined,
      filesToUpload.length > 0 ? filesToUpload : undefined,
      detectedSlashCommand ? commandToRequestType(detectedSlashCommand) : undefined,
    );

    // Clear editor + pending files
    editor.commands.clearContent();
    setMentionedDocs(new Map());
    // Revoke blob URLs
    pendingFiles.forEach((pf) => {
      if (pf.preview) URL.revokeObjectURL(pf.preview);
    });
    setPendingFiles([]);
  }, [editor, isStreaming, onSend, pendingFiles]);

  // Keep ref in sync
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // Check if editor has meaningful content
  const hasContent = editor ? !editor.isEmpty : false;
  const hasPendingFiles = pendingFiles.length > 0;

  return (
    <div
      className="shrink-0 px-4 pt-3 pb-4 bg-gradient-to-t from-slate-50/80 to-background dark:from-zinc-900/80 dark:to-background relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* File upload preview bar */}
      {pendingFiles.length > 0 && (
        <div className="mb-2">
          <FileUploadPreview files={pendingFiles} onRemove={handleRemoveFile} />
        </div>
      )}

      {/* Input card — bọc toàn bộ vào 1 card hiện đại */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-md shadow-slate-200/60 dark:shadow-zinc-950/60 focus-within:ring-2 focus-within:ring-indigo-400/40 focus-within:border-indigo-300 dark:focus-within:border-indigo-600 transition-all">
        {/* TipTap editor */}
        <div className="min-h-[44px] max-h-[140px] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {/* Toolbar dưới editor */}
        <div className="flex items-center gap-1 px-2 pb-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
          {/* Nút "+" — Công cụ hỗ trợ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg shrink-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                disabled={isStreaming || isSessionLimitReached}
                aria-label={t('input.toolsLabel')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="mb-1 min-w-[180px]">
              <DropdownMenuItem onClick={onSummarizeClick} disabled={isStreaming || isSessionLimitReached} className="gap-2 text-amber-700 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40">
                <FileText className="h-4 w-4 text-amber-500" />
                {t('input.summarizeDoc')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDiffClick} disabled={isStreaming || isSessionLimitReached} className="gap-2 text-purple-700 dark:text-purple-400 focus:text-purple-700 dark:focus:text-purple-400 focus:bg-purple-50 dark:focus:bg-purple-950/40">
                <GitCompareArrows className="h-4 w-4 text-purple-500" />
                {t('input.diffVersion')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCompareClick} disabled={isStreaming || isSessionLimitReached} className="gap-2 text-indigo-700 dark:text-indigo-400 focus:text-indigo-700 dark:focus:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-950/40">
                <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
                {t('input.compareDocs')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTranslateClick} disabled={isStreaming || isSessionLimitReached} className="gap-2 text-green-700 dark:text-green-400 focus:text-green-700 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-950/40">
                <Languages className="h-4 w-4 text-green-500" />
                {t('input.translateText')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Nút clip icon — Đính kèm file */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            disabled={isStreaming || isSessionLimitReached || pendingFiles.length >= MAX_FILES}
            onClick={() => fileInputRef.current?.click()}
            aria-label={t('upload.attachFile')}
            title={t('upload.attachFile')}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                validateAndAddFiles(e.target.files);
              }
              e.target.value = '';
            }}
          />

          {/* Hint text */}
          <p className="flex-1 text-xs text-muted-foreground text-center select-none">
            {isStreaming ? t('input.hintStreaming') : t('input.hint')}
          </p>

          {/* Send / Cancel button */}
          {isStreaming ? (
            <Button
              size="icon"
              variant="outline"
              onClick={onCancel}
              className="h-8 w-8 rounded-lg shrink-0 border-rose-300 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              aria-label={t('input.cancelBtn')}
              title={t('input.cancelTitle')}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={(!hasContent && mentionedDocs.size === 0 && !hasPendingFiles) || isStreaming || isSessionLimitReached}
              className="h-8 w-8 rounded-lg shrink-0 inline-flex items-center justify-center transition-all
                bg-gradient-to-br from-indigo-600 to-violet-600
                hover:from-indigo-700 hover:to-violet-700
                text-white shadow-sm shadow-indigo-300/50 dark:shadow-indigo-900/40
                disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed
                dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 dark:disabled:text-zinc-500"
              aria-label={t('input.send')}
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
