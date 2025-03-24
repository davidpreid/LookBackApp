import React, { useState, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import { supabase } from '../lib/supabase';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading,
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Smile,
  Palette,
  Plus,
  Trash2,
  X,
  ChevronDown,
  Sun,
  Moon,
  Undo,
  Redo
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const FONT_FAMILIES = [
  { name: 'Default', value: 'Inter' },
  { name: 'Serif', value: 'Georgia' },
  { name: 'Mono', value: 'monospace' },
  { name: 'Cursive', value: 'Dancing Script' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
];

const TEXT_COLORS = [
  { name: 'Default', value: '#000000' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Yellow', value: '#CA8A04' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Gray', value: '#4B5563' },
];

const THEMES = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    toolbar: 'bg-gray-50',
    hover: 'hover:bg-gray-100',
    active: 'bg-gray-200',
    divider: 'bg-gray-200',
    select: 'bg-white text-gray-900 border-gray-200',
    selectHover: 'hover:border-gray-300',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
    toolbar: 'bg-gray-800',
    hover: 'hover:bg-gray-700',
    active: 'bg-gray-600',
    divider: 'bg-gray-700',
    select: 'bg-gray-800 text-gray-100 border-gray-700',
    selectHover: 'hover:border-gray-600',
  },
  sepia: {
    background: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
    toolbar: 'bg-amber-100',
    hover: 'hover:bg-amber-200',
    active: 'bg-amber-300',
    divider: 'bg-amber-200',
    select: 'bg-amber-50 text-amber-900 border-amber-200',
    selectHover: 'hover:border-amber-300',
  },
};

const lowlight = createLowlight();
lowlight.register('javascript', javascript);

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [theme, setTheme] = useState<keyof typeof THEMES>('light');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      FontFamily,
      TextStyle,
      Color,
      Highlight,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'text-indigo-600 hover:text-indigo-800 underline',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('memory-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('memory-images')
        .getPublicUrl(fileName);

      editor.chain().focus().setImage({ src: publicUrl }).run();
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const addTable = () => {
    editor.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const addCodeBlock = () => {
    editor.chain()
      .focus()
      .setCodeBlock()
      .run();
  };

  const addEmoji = (emoji: any) => {
    editor.chain().focus().insertContent(emoji.native).run();
    setShowEmojiPicker(false);
  };

  const currentTheme = THEMES[theme];

  return (
    <div className={`relative border rounded-lg overflow-hidden ${currentTheme.background} ${currentTheme.border}`}>
      <div className={`flex flex-wrap gap-1 p-2 ${currentTheme.toolbar} border-b ${currentTheme.border}`}>
        {/* Text style controls */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('bold') ? currentTheme.active : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('italic') ? currentTheme.active : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('underline') ? currentTheme.active : ''
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className={`w-px h-6 ${currentTheme.divider} mx-1 self-center`} />

        {/* Alignment controls */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive({ textAlign: 'left' }) ? currentTheme.active : ''
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive({ textAlign: 'center' }) ? currentTheme.active : ''
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive({ textAlign: 'right' }) ? currentTheme.active : ''
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className={`w-px h-6 ${currentTheme.divider} mx-1 self-center`} />

        {/* Lists and Headings */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('bulletList') ? currentTheme.active : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('orderedList') ? currentTheme.active : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className={`w-px h-6 ${currentTheme.divider} mx-1 self-center`} />

        {/* Font Family Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className={`h-full px-2 py-1 rounded border ${currentTheme.select} ${currentTheme.selectHover} transition-colors`}
            title="Font Family"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value} className={currentTheme.background}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Color Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className={`h-full px-2 py-1 rounded border ${currentTheme.select} ${currentTheme.selectHover} transition-colors`}
            title="Text Color"
          >
            {TEXT_COLORS.map((color) => (
              <option key={color.value} value={color.value} className={currentTheme.background}>
                {color.name}
              </option>
            ))}
          </select>
        </div>

        {/* Link */}
        <button
          onClick={toggleLink}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('link') ? currentTheme.active : ''
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded ${currentTheme.hover}`}
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Table */}
        <button
          onClick={addTable}
          className={`p-2 rounded ${currentTheme.hover}`}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        {/* Code Block */}
        <button
          onClick={addCodeBlock}
          className={`p-2 rounded ${currentTheme.hover} ${
            editor.isActive('codeBlock') ? currentTheme.active : ''
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        {/* Emoji Picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded ${currentTheme.hover}`}
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute z-50 top-full mt-1 shadow-lg">
              <div className={`p-1 rounded-lg border ${currentTheme.background} ${currentTheme.border}`}>
                <Picker
                  data={data}
                  onEmojiSelect={addEmoji}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={`w-px h-6 ${currentTheme.divider} mx-1 self-center`} />

        {/* Theme Selector */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light')}
          className={`p-2 rounded ${currentTheme.hover}`}
          title="Change Theme"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Palette className="w-4 h-4" />
          )}
        </button>

        {/* Undo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            !editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className={`p-2 rounded ${currentTheme.hover} ${
            !editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <EditorContent 
        editor={editor} 
        className={`prose max-w-none p-4 min-h-[200px] focus:outline-none ${currentTheme.text}`}
      />

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className={`flex gap-1 p-2 rounded-lg shadow-lg border ${currentTheme.background} ${currentTheme.border}`}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${currentTheme.hover} ${
              editor.isActive('bold') ? currentTheme.active : ''
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${currentTheme.hover} ${
              editor.isActive('italic') ? currentTheme.active : ''
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded ${currentTheme.hover} ${
              editor.isActive('underline') ? currentTheme.active : ''
            }`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={toggleLink}
            className={`p-1 rounded ${currentTheme.hover} ${
              editor.isActive('link') ? currentTheme.active : ''
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}
    </div>
  );
} 