'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from 'react';
import { FileText, FileSpreadsheet, FileImage, File } from 'lucide-react';

/**
 * Icon theo MIME type — color-coded giống citation-card.tsx pattern.
 */
function getFileIcon(mimeType: string) {
  if (mimeType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel'))
    return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
  if (mimeType?.includes('image')) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (mimeType?.includes('word') || mimeType?.includes('document'))
    return <FileText className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-gray-500" />;
}

export interface MentionSuggestionItem {
  id: string;
  label: string; // fileName
  mimeType: string;
}

interface MentionSuggestionListProps {
  items: MentionSuggestionItem[];
  command: (item: { id: string; label: string }) => void;
}

export const MentionSuggestionList = forwardRef<unknown, MentionSuggestionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command({ id: item.id, label: item.label });
        }
      },
      [items, command],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
          Không tìm thấy tài liệu
        </div>
      );
    }

    return (
      <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg py-1 max-h-[300px] overflow-y-auto min-w-[250px]">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
              index === selectedIndex ? 'bg-accent' : ''
            }`}
            onClick={() => selectItem(index)}
          >
            {getFileIcon(item.mimeType)}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    );
  },
);
MentionSuggestionList.displayName = 'MentionSuggestionList';
