"use client"

import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ChatMessageProps } from "../types";
import { JSX } from "react";

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Zkopírováno");
    } catch {
      toast.error("Kopírování selhalo");
    }
  };

  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let codeBlock: string[] | null = null;
    let codeLang = '';

    const flushList = () => {
      if (!currentList) return;
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1 pl-4">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-foreground/40 shrink-0" />
                <span>{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 space-y-1 pl-4">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-medium text-muted-foreground text-sm shrink-0 min-w-[1.25rem]">{i + 1}.</span>
                <span>{parseInline(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    };

    const parseInline = (text: string): JSX.Element => {
      const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      return (
        <>
          {parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-[0.8em] font-mono">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </>
      );
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        if (codeBlock === null) {
          flushList();
          codeBlock = [];
          codeLang = trimmed.slice(3).trim();
        } else {
          const codeContent = codeBlock.join('\n');
          elements.push(
            <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden border border-border">
              {codeLang && (
                <div className="flex items-center justify-between px-4 py-1.5 bg-muted/60 text-xs text-muted-foreground">
                  <span>{codeLang}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => navigator.clipboard.writeText(codeContent)}>
                    <Copy className="size-3" /> Kopírovat
                  </Button>
                </div>
              )}
              <pre className="px-4 py-3 overflow-x-auto bg-muted/20 text-sm font-mono leading-6">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
          codeBlock = null;
          codeLang = '';
        }
        return;
      }
      if (codeBlock !== null) { codeBlock.push(line); return; }

      if (!trimmed) {
        flushList();
        if (elements.length > 0) elements.push(<div key={`sp-${index}`} className="h-2" />);
        return;
      }

      if (/^[•\-*]\s/.test(trimmed)) {
        const item = trimmed.replace(/^[•\-*]\s*/, '');
        if (!currentList || currentList.type !== 'ul') { flushList(); currentList = { type: 'ul', items: [] }; }
        currentList.items.push(item);
        return;
      }

      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        if (!currentList || currentList.type !== 'ol') { flushList(); currentList = { type: 'ol', items: [] }; }
        currentList.items.push(numMatch[2]);
        return;
      }

      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        flushList();
        elements.push(<h2 key={index} className="font-semibold text-base mt-4 mb-1 first:mt-0">{trimmed.replace(/^#{1,2}\s*/, '')}</h2>);
        return;
      }
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="font-semibold text-sm mt-3 mb-1 first:mt-0">{trimmed.slice(4)}</h3>);
        return;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
        flushList();
        elements.push(<p key={index} className="font-semibold mt-3 mb-0.5 first:mt-0">{trimmed.slice(2, -2)}</p>);
        return;
      }

      flushList();
      elements.push(<p key={index} className="leading-7">{parseInline(line)}</p>);
    });

    flushList();
    return elements;
  };

  // User message – right-aligned grey bubble
  if (isUser) {
    return (
      <div className="flex justify-end py-1 px-4 lg:px-0">
        <div className="bg-muted rounded-3xl px-4 py-2.5 max-w-[70%] text-sm leading-6 break-words">
          {content}
        </div>
      </div>
    );
  }

  // AI message – left aligned, no bubble
  return (
    <div className="py-2 px-4 lg:px-0">
      <div className="text-sm leading-7 text-foreground prose-like">
        {renderContent()}
        {isStreaming && (
          <span className="inline-block w-[3px] h-[1.1em] ml-0.5 bg-foreground/60 rounded-sm animate-pulse align-middle" />
        )}
      </div>

      {!isStreaming && content && (
        <div className="flex items-center gap-0.5 mt-1.5 -ml-1.5">
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={handleCopy} title="Kopírovat">
            <Copy className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={() => toast.success("Díky")} title="Líbí se mi">
            <ThumbsUp className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={() => toast.success("Díky")} title="Nelíbí se mi">
            <ThumbsDown className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={handleCopy} title="Sdílet">
            <Share2 className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" onClick={() => toast.info("Regeneruji...")} title="Znovu">
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
