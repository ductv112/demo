import { Node, mergeAttributes } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { SLASH_COMMANDS, type SlashCommandItem } from './slash-commands';
import { SlashCommandList, type SlashCommandListRef } from './slash-command-list';

export function createSlashSuggestion(options: {
  onNewSession: () => void;
  onSuggestionOpen: () => void;
  onSuggestionClose: () => void;
}): Omit<SuggestionOptions<SlashCommandItem>, 'editor'> {
  return {
    char: '/',
    startOfLine: false,
    items: ({ query }) => {
      const q = query.toLowerCase();
      return q ? SLASH_COMMANDS.filter((c) => c.command.startsWith(q)) : SLASH_COMMANDS;
    },
    command: ({ editor, range, props: item }) => {
      // Per D-08: /new thuc hien ngay, khong insert badge
      if (item.command === 'new') {
        editor.chain().focus().deleteRange(range).run();
        options.onNewSession();
        return;
      }

      // Per D-03: Truoc khi insert, xoa slash command badge cu neu co (max 1 badge)
      // Tim vi tri badge cu truoc khi thay doi document
      const oldBadgePositions: { from: number; to: number }[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'slashCommand') {
          oldBadgePositions.push({ from: pos, to: pos + node.nodeSize });
        }
      });

      // Xoa tu cuoi len dau de khong lech offset, roi insert badge moi
      let chain = editor.chain().focus().deleteRange(range);
      for (const { from, to } of oldBadgePositions.reverse()) {
        chain = chain.deleteRange({ from, to });
      }
      chain
        .insertContent([
          { type: 'slashCommand', attrs: { command: item.command, label: item.label } },
          { type: 'text', text: ' ' },
        ])
        .run();
    },
    render: () => {
      let component: ReactRenderer | null = null;
      let popup: TippyInstance[] | null = null;
      return {
        onStart: (props: SuggestionProps<SlashCommandItem>) => {
          options.onSuggestionOpen();
          component = new ReactRenderer(SlashCommandList, {
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
        onUpdate(props: SuggestionProps<SlashCommandItem>) {
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
            options.onSuggestionClose();
            return true;
          }
          if (props.event.key === 'Tab') {
            props.event.preventDefault();
          }
          return (
            (component?.ref as SlashCommandListRef | null)?.onKeyDown?.(props) ?? false
          );
        },
        onExit() {
          options.onSuggestionClose();
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}

export const SlashCommandExtension = Node.create({
  name: 'slashCommand',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      command: { default: null },
      label: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-slash-command]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-slash-command': node.attrs.command,
        class:
          'inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-normal border border-blue-200 dark:border-blue-700 not-editable',
      }),
      node.attrs.label ?? `/${node.attrs.command}`,
    ];
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },

  addOptions() {
    return {
      suggestion: {} as Omit<SuggestionOptions<SlashCommandItem>, 'editor'>,
    };
  },
});
