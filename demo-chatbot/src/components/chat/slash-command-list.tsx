'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SlashCommandItem } from './slash-commands';

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

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
          if (items[selectedIndex]) command(items[selectedIndex]);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
          Không có lệnh phù hợp
        </div>
      );
    }

    return (
      <div className="bg-popover border rounded-lg shadow-lg py-1 max-h-[300px] overflow-y-auto min-w-[280px]">
        {items.map((item, index) => (
          <button
            key={item.command}
            type="button"
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${
              index === selectedIndex ? 'bg-accent' : ''
            }`}
            onClick={() => command(item)}
          >
            <span className="font-semibold text-foreground shrink-0">{item.label}</span>
            <span className="text-muted-foreground truncate">{item.description}</span>
          </button>
        ))}
      </div>
    );
  },
);
SlashCommandList.displayName = 'SlashCommandList';
