'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  LexicalEditor
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $patchStyleText } from '@lexical/selection';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3,
  Undo, Redo,
  ChevronDown,
  Type,
  Baseline,
  Highlighter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'];

function Sep() {
  return <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />;
}

interface LexicalToolbarProps {
  editor?: LexicalEditor | null;
  className?: string;
  isSticky?: boolean;
  activeFieldLabel?: string;
  customActions?: React.ReactNode;
}

export default function LexicalToolbar({ editor: externalEditor, className, isSticky, activeFieldLabel, customActions }: LexicalToolbarProps) {
  const [internalEditor] = useLexicalContextSafe();
  const editor = externalEditor || internalEditor;

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  // Helper to safely get context
  function useLexicalContextSafe() {
    try {
      return useLexicalComposerContext();
    } catch (e) {
      return [null];
    }
  }

  const updateToolbar = useCallback(() => {
    if (!editor) return;
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));
      }
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    if (!editor) return;
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        setCanUndo(payload);
        return false;
      },
      1
    );
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload: boolean) => {
        setCanRedo(payload);
        return false;
      },
      1
    );
  }, [editor]);

  const applyStyle = (style: Record<string, string>) => {
    if (!editor) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, style);
      }
    });
  };

  const formatHeading = (tag: HeadingTagType) => {
    if (!editor) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const b = (active?: boolean, disabled?: boolean) =>
    cn(
      "flex items-center justify-center h-8 px-2 rounded-lg transition-all shrink-0 select-none text-[12px] font-bold",
      active
        ? "bg-[var(--primary)]/20 text-[var(--primary)]"
        : "text-[var(--foreground)] hover:bg-[var(--foreground)]/10",
      (disabled || !editor) && "opacity-30 cursor-not-allowed"
    );

  if (!editor) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-11 px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-20 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)]",
          isSticky && "sticky top-0 z-[60]",
          className
        )}
      >
        Select a field to edit
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center flex-nowrap overflow-x-auto gap-0.5 p-1.5 w-full select-none bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)] scrollbar-hide",
        isSticky && "sticky top-0 z-[60]",
        className
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      {activeFieldLabel && (
        <>
          <div className="px-3 py-1 bg-[var(--primary)]/10 rounded-lg shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">{activeFieldLabel}</span>
          </div>
          <Sep />
        </>
      )}

      {/* Undo / Redo */}
      <button className={b()} disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo size={14} /></button>
      <button className={b()} disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo size={14} /></button>
      <Sep />

      {/* Headings */}
      <button className={b()} onClick={() => formatHeading('h1')}>H1</button>
      <button className={b()} onClick={() => formatHeading('h2')}>H2</button>
      <button className={b()} onClick={() => formatHeading('h3')}>H3</button>
      <Sep />

      {/* Formatting */}
      <button className={b(isBold)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><Bold size={14} /></button>
      <button className={b(isItalic)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><Italic size={14} /></button>
      <button className={b(isUnderline)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}><Underline size={14} /></button>
      <button className={b(isStrikethrough)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}><Strikethrough size={14} /></button>
      <Sep />

      {/* Font Size & Color Placeholders (Dropdowns can be added here) */}
      <div className="flex items-center gap-1">
        {FONT_SIZES.slice(0, 5).map(size => (
          <button key={size} className={cn(b(), "px-1.5 text-[10px]")} onClick={() => applyStyle({ 'font-size': size })}>{size.replace('px', '')}</button>
        ))}
      </div>
      <Sep />

      {/* Color Circles */}
      <div className="flex items-center gap-1 px-1">
        {COLORS.map(color => (
          <button
            key={color}
            className="w-4 h-4 rounded-full border border-[var(--border)]"
            style={{ background: color }}
            onClick={() => applyStyle({ color })}
          />
        ))}
      </div>
      <Sep />

      {/* Alignment */}
      <button className={b()} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}><AlignLeft size={14} /></button>
      <button className={b()} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}><AlignCenter size={14} /></button>
      <button className={b()} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}><AlignRight size={14} /></button>
      <Sep />

      {/* Lists */}
      <button className={b()} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={14} /></button>
      <button className={b()} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={14} /></button>

      {customActions && (
        <>
          <Sep />
          <div className="flex items-center gap-1">
            {customActions}
          </div>
        </>
      )}
    </div>
  );
}
