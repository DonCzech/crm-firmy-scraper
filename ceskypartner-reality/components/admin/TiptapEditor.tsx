"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Code,
} from "lucide-react";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
        active
          ? "bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
          : "text-[var(--a-text-3)] hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content = "", onChange, placeholder = "Zacnete psat..." }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[var(--a-bronze)] underline" },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full h-auto" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] px-5 py-4 text-[var(--a-text)] outline-none [&_h1]:text-[22px] [&_h1]:font-semibold [&_h1]:text-[var(--a-text)] [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-[var(--a-text)] [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-[var(--a-text)] [&_p]:text-[13.5px] [&_p]:leading-relaxed [&_p]:text-[var(--a-text-2)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--a-bronze)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--a-text-2)] [&_ul]:list-disc [&_ol]:list-decimal [&_li]:text-[13.5px] [&_li]:text-[var(--a-text-2)] [&_code]:rounded [&_code]:bg-[var(--a-surface-2)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:text-[var(--a-bronze)] [&_hr]:border-[var(--a-border)]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt("URL odkazu:");
    if (url) {
      editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }

  function addImage() {
    const url = window.prompt("URL obrazku:");
    if (url) {
      editor!.chain().focus().setImage({ src: url }).run();
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--a-border)] px-3 py-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Nadpis 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Nadpis 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Nadpis 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-[var(--a-border)]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Tucne"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Kurziva"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Preskrtnute"
        >
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Kod"
        >
          <Code size={15} />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-[var(--a-border)]" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Odrazky"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Cislovani"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citace"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Oddelovac"
        >
          <Minus size={15} />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-[var(--a-border)]" />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Odkaz">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Obrazek">
          <ImageIcon size={15} />
        </ToolbarButton>

        <div className="ml-auto flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Zpet"
          >
            <Undo size={15} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Znovu"
          >
            <Redo size={15} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Word count */}
      <div className="border-t border-[var(--a-border)] px-4 py-2">
        <p className="text-[10px] text-[var(--a-text-3)]">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} znaku
        </p>
      </div>
    </div>
  );
}
