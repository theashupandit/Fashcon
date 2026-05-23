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
  LexicalEditor
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import {
  $createHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $patchStyleText } from '@lexical/selection';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo,
  ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FONT_SIZES = [
    '10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', 
    '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px'
];

const COLORS = [
    // Grayscale
    '#000000', '#1a1a1a', '#333333', '#666666', '#999999', '#cccccc', '#eeeeee', '#ffffff',
    // Brand & Luxury
    '#e60023', '#bf001d', '#990017', '#ff4e7c', '#ec4899', '#db2777', '#be185d', '#9d174d',
    // Vibrants
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e'
];

function Sep() {
  return <div className="w-px h-6 bg-[var(--border)] mx-1.5 shrink-0" />;
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
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload: boolean) => {
        setCanUndo(payload);
        return false;
      },
      1
    );
    const unregisterRedo = editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload: boolean) => {
          setCanRedo(payload);
          return false;
        },
        1
      );
    return () => {
        unregisterSelection();
        unregisterUndo();
        unregisterRedo();
    };
  }, [editor, updateToolbar]);

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
      <div className={cn("flex items-center justify-center h-11 px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-20 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)]", isSticky && "sticky top-0 z-[60]", className)}>
        Select a field to edit
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center flex-nowrap overflow-x-auto gap-0.5 p-1.5 w-full select-none bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)]",
        isSticky && "sticky top-0 z-[60]",
        className
      )}
      onMouseDown={(e) => e.preventDefault()}
      style={{ scrollbarWidth: 'auto', msOverflowStyle: 'auto' } as any}
    >
      <style jsx>{`
        div {
          scrollbar-width: thin !important;
          -ms-overflow-style: auto !important;
        }
        div::-webkit-scrollbar {
          height: 4px !important;
          display: block !important;
        }
        div::-webkit-scrollbar-track {
          background: transparent !important;
        }
        div::-webkit-scrollbar-thumb {
          background: var(--primary) !important;
          opacity: 0.3 !important;
          border-radius: 10px !important;
        }
        div:hover::-webkit-scrollbar-thumb {
          opacity: 0.6 !important;
        }
      `}</style>
      
      {activeFieldLabel && (
        <>
          <div className="px-3 py-1 bg-[var(--primary)]/10 rounded-lg shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">{activeFieldLabel}</span>
          </div>
          <Sep />
        </>
      )}

      {/* Undo / Redo */}
      <div className="flex items-center shrink-0">
        <button className={b()} disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><Undo size={14} /></button>
        <button className={b()} disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><Redo size={14} /></button>
      </div>
      <Sep />

      {/* Headings */}
      <div className="flex items-center shrink-0">
        <button className={b()} onClick={() => formatHeading('h1')}>H1</button>
        <button className={b()} onClick={() => formatHeading('h2')}>H2</button>
        <button className={b()} onClick={() => formatHeading('h3')}>H3</button>
      </div>
      <Sep />

      {/* Formatting */}
      <div className="flex items-center shrink-0">
        <button className={b(isBold)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}><Bold size={14} /></button>
        <button className={b(isItalic)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}><Italic size={14} /></button>
        <button className={b(isUnderline)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}><Underline size={14} /></button>
        <button className={b(isStrikethrough)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}><Strikethrough size={14} /></button>
      </div>
      <Sep />

      {/* Font Size List */}
      <div className="flex items-center gap-1 shrink-0 px-1">
        <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter mr-1">Size</span>
        <div className="flex items-center gap-0.5">
            {FONT_SIZES.map(size => (
                <button 
                    key={size} 
                    className={cn(b(), "px-1 min-w-[28px] h-7 text-[10px] border border-transparent hover:border-[var(--border)]")} 
                    onClick={() => applyStyle({ 'font-size': size })}
                >
                    {size.replace('px', '')}
                </button>
            ))}
        </div>
      </div>
      <Sep />

      {/* Expanded Color Palette */}
      <div className="flex items-center gap-1 shrink-0 px-1">
        <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter mr-1">Color</span>
        <div className="flex flex-wrap items-center gap-1 max-w-[300px]">
            {COLORS.map(color => (
                <button
                    key={color}
                    className="w-3.5 h-3.5 rounded-full border border-white/10 ring-1 ring-black/10 hover:scale-125 transition-transform shrink-0 shadow-sm"
                    style={{ background: color }}
                    onClick={() => applyStyle({ color })}
                    title={color}
                />
            ))}
        </div>
      </div>
      <Sep />

      {/* Alignment */}
      <div className="flex items-center shrink-0">
        <button className={b()} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}><AlignLeft size={14} /></button>
        <button className={b()} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}><AlignCenter size={14} /></button>
        <button className={b()} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}><AlignRight size={14} /></button>
      </div>
      <Sep />

      {/* Lists */}
      <div className="flex items-center shrink-0">
        <button className={b()} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={14} /></button>
        <button className={b()} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={14} /></button>
      </div>

      {customActions && (
        <>
          <Sep />
          <div className="flex items-center gap-1 shrink-0">
            {customActions}
          </div>
        </>
      )}
    </div>
  );
}
