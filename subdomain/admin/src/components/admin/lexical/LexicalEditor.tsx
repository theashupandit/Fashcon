'use client';

import React, { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, DecoratorNode, NodeKey, DOMExportOutput, DOMConversionMap } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTheme } from './LexicalTheme';
import LexicalToolbar from './LexicalToolbar';
import { cn } from '@/lib/utils';

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('div');
    elem.style.margin = '24px 0';
    elem.style.textAlign = 'center';
    return elem;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: (domNode: Node) => {
          if (domNode instanceof HTMLImageElement) {
            const src = domNode.getAttribute('src') || '';
            const alt = domNode.getAttribute('alt') || '';
            return { node: new ImageNode(src, alt) };
          }
          return null;
        },
        priority: 1,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.style.width = '100%';
    element.style.borderRadius = '16px';
    element.style.margin = '24px 0';
    element.style.display = 'block';
    return { element };
  }

  exportJSON() {
    return {
      type: 'image',
      src: this.__src,
      altText: this.__altText,
      version: 1,
    };
  }

  static importJSON(serializedNode: any): ImageNode {
    return new ImageNode(serializedNode.src, serializedNode.altText);
  }

  decorate(): React.ReactNode {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        className="w-full rounded-2xl my-6 block max-h-[450px] object-cover shadow-md"
      />
    );
  }
}

// --- HTML SYNC PLUGIN ---
function HtmlSyncPlugin({ 
  initialHtml, 
  onChange 
}: { 
  initialHtml: string; 
  onChange: (html: string) => void 
}) {
  const [editor] = useLexicalComposerContext();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Force native spellcheck on the root element and keep it active
    const applyAttributes = (root: HTMLElement | null) => {
      if (root) {
        root.setAttribute('spellcheck', 'true');
        root.setAttribute('lang', 'en');
        root.setAttribute('autocorrect', 'on');
      }
    };

    const root = editor.getRootElement();
    applyAttributes(root);

    return editor.registerRootListener((nextRoot) => {
      applyAttributes(nextRoot);
    });
  }, [editor]);

  useEffect(() => {
    if (!hasHydrated && initialHtml) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.select();
        $insertNodes(nodes);
      });
      setHasHydrated(true);
    }
  }, [editor, initialHtml, hasHydrated]);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor);
          onChange(html);
        });
      }}
    />
  );
}

interface LexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  customActions?: React.ReactNode;
  activeFieldLabel?: string;
}

export default function LexicalEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  customActions,
  activeFieldLabel
}: LexicalEditorProps) {
  
  const initialConfig = {
    namespace: 'FashconEditor',
    theme: LexicalTheme,
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      ImageNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div 
        spellCheck={true}
        className="rounded-2xl border border-[var(--border)] bg-[var(--background)] transition-all overflow-visible flex flex-col min-h-[600px]"
      >
        <LexicalToolbar 
          isSticky 
          customActions={customActions} 
          activeFieldLabel={activeFieldLabel}
        />
        
        <div className="relative flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                spellCheck={true}
                lang="en"
                autoCorrect="on"
                autoCapitalize="sentences"
                autoFocus={true}
                className="prose prose-sm dark:prose-invert max-w-none p-4 sm:p-8 md:p-12 min-h-[500px] focus:outline-none" 
              />
            }
            placeholder={
              <div className="absolute top-[32px] left-[32px] sm:top-[64px] sm:left-[64px] md:top-[96px] md:left-[96px] pointer-events-none opacity-20 text-sm font-medium">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <HtmlSyncPlugin initialHtml={content} onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
