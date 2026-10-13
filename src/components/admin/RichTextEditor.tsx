"use client";
import { useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import {
  Undo2, Redo2, Bold, Italic, Strikethrough, Underline, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  Link2, Unlink, Table, Quote, Minus, Trash2, Check, X,
} from "lucide-react";
import { useI18n } from "@/i18n";

type Props = {
  /** HTML initial. Le composant n'est pas contrôlé : changer `key` pour recharger un autre contenu. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "legal-content min-h-[24rem] px-6 py-5 text-sm" },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#E87722]">
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-gray-200 bg-gray-50" />}
      <div className="max-h-[36rem] overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const { t } = useI18n();
  const te = t.adminEditor;
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      block: e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : e.isActive("heading", { level: 4 })
            ? "h4"
            : "p",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      underline: e.isActive("underline"),
      highlight: e.isActive("highlight"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      align: (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      inTable: e.isActive("table"),
    }),
  });

  const chain = () => editor.chain().focus();

  const setBlock = (value: string) => {
    if (value === "p") chain().setParagraph().run();
    else chain().setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
  };

  const openLink = () => {
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      chain().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^(https?:\/\/|mailto:|\/)/i.test(url) ? url : `https://${url}`;
      chain().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Btn title={te.undo} disabled={!s.canUndo} onClick={() => chain().undo().run()}><Undo2 /></Btn>
        <Btn title={te.redo} disabled={!s.canRedo} onClick={() => chain().redo().run()}><Redo2 /></Btn>
        <Sep />
        <select
          value={s.block}
          onChange={(e) => setBlock(e.target.value)}
          className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          title={te.textStyle}
        >
          <option value="p">{te.paragraph}</option>
          <option value="h2">{te.heading}</option>
          <option value="h3">{te.subheading}</option>
          <option value="h4">{te.smallHeading}</option>
        </select>
        <Sep />
        <Btn title={te.bold} active={s.bold} onClick={() => chain().toggleBold().run()}><Bold /></Btn>
        <Btn title={te.italic} active={s.italic} onClick={() => chain().toggleItalic().run()}><Italic /></Btn>
        <Btn title={te.underline} active={s.underline} onClick={() => chain().toggleUnderline().run()}><Underline /></Btn>
        <Btn title={te.strike} active={s.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough /></Btn>
        <Btn title={te.highlight} active={s.highlight} onClick={() => chain().toggleHighlight().run()}><Highlighter /></Btn>
        <Sep />
        <Btn title={te.bulletList} active={s.bulletList} onClick={() => chain().toggleBulletList().run()}><List /></Btn>
        <Btn title={te.orderedList} active={s.orderedList} onClick={() => chain().toggleOrderedList().run()}><ListOrdered /></Btn>
        <Btn title={te.quote} active={s.blockquote} onClick={() => chain().toggleBlockquote().run()}><Quote /></Btn>
        <Btn title={te.divider} onClick={() => chain().setHorizontalRule().run()}><Minus /></Btn>
        <Sep />
        <Btn title={te.alignLeft} active={s.align === "left"} onClick={() => chain().setTextAlign("left").run()}><AlignLeft /></Btn>
        <Btn title={te.center} active={s.align === "center"} onClick={() => chain().setTextAlign("center").run()}><AlignCenter /></Btn>
        <Btn title={te.alignRight} active={s.align === "right"} onClick={() => chain().setTextAlign("right").run()}><AlignRight /></Btn>
        <Btn title={te.justify} active={s.align === "justify"} onClick={() => chain().setTextAlign("justify").run()}><AlignJustify /></Btn>
        <Sep />
        <Btn title={te.link} active={s.link || linkOpen} onClick={openLink}><Link2 /></Btn>
        {s.link && (
          <Btn title={te.unlink} onClick={() => chain().extendMarkRange("link").unsetLink().run()}><Unlink /></Btn>
        )}
        <Btn
          title={te.insertTable}
          active={s.inTable}
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <Table />
        </Btn>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-t border-gray-200 px-3 py-2">
          <span className="text-xs font-medium text-gray-500">{te.linkLabel}</span>
          <input
            autoFocus
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") { e.preventDefault(); setLinkOpen(false); }
            }}
            placeholder={te.linkPlaceholder}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          />
          <Btn title={te.apply} onClick={applyLink}><Check /></Btn>
          <Btn title={te.cancel} onClick={() => setLinkOpen(false)}><X /></Btn>
        </div>
      )}

      {s.inTable && (
        <div className="flex flex-wrap items-center gap-1 border-t border-gray-200 px-3 py-1.5 text-xs">
          <span className="font-medium text-gray-500 mr-1">{te.table}</span>
          <TextBtn onClick={() => chain().addRowAfter().run()}>{te.addRow}</TextBtn>
          <TextBtn onClick={() => chain().addColumnAfter().run()}>{te.addColumn}</TextBtn>
          <TextBtn onClick={() => chain().deleteRow().run()}>{te.deleteRow}</TextBtn>
          <TextBtn onClick={() => chain().deleteColumn().run()}>{te.deleteColumn}</TextBtn>
          <TextBtn onClick={() => chain().toggleHeaderRow().run()}>{te.headerRow}</TextBtn>
          <TextBtn onClick={() => chain().mergeOrSplit().run()}>{te.mergeSplit}</TextBtn>
          <button
            type="button"
            onClick={() => chain().deleteTable().run()}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> {te.deleteTable}
          </button>
        </div>
      )}
    </div>
  );
}

function Btn({
  title, active, disabled, onClick, children,
}: { title: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors [&_svg]:h-4 [&_svg]:w-4 disabled:opacity-30 disabled:pointer-events-none ${
        active ? "bg-[#FFF3E0] text-[#E87722]" : "text-gray-600 hover:bg-gray-200/70 hover:text-[#1A1A2E]"
      }`}
    >
      {children}
    </button>
  );
}

function TextBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-600 hover:border-[#E87722] hover:text-[#E87722]"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />;
}
