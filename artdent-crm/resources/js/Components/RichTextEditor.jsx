import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, ChevronDown } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

// ─── TextStyle con fontSize integrado ────────────────────────────────────────
// Extiende TextStyle directamente para que fontSize sea un atributo real del mark.
const TextStyleExtended = TextStyle.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            fontSize: {
                default: null,
                parseHTML: element => element.style.fontSize || null,
                renderHTML: attributes => {
                    if (!attributes.fontSize) return {};
                    return { style: `font-size: ${attributes.fontSize}` };
                },
            },
        };
    },
});

// ─── ToolbarButton ────────────────────────────────────────────────────────────
function ToolbarButton({ onClick, active, title, children, isDark }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`h-7 w-7 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                ${active
                    ? 'text-white shadow-sm'
                    : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
            style={active ? { background: 'linear-gradient(135deg, #397B9C, #49949C)' } : {}}
        >
            {children}
        </button>
    );
}

function Divider({ isDark }) {
    return <div className={`w-px h-5 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />;
}

const FONT_SIZES = [
    { label: 'Pequeño',    value: '12px' },
    { label: 'Normal',     value: '14px' },
    { label: 'Mediano',    value: '16px' },
    { label: 'Grande',     value: '18px' },
    { label: 'Muy grande', value: '22px' },
    { label: 'Título',     value: '28px' },
];

const COLORS = [
    { label: 'Negro',      value: '#000000' },
    { label: 'Gris oscuro',value: '#374151' },
    { label: 'Gris',       value: '#6B7280' },
    { label: 'Rojo',       value: '#DC2626' },
    { label: 'Naranja',    value: '#EA580C' },
    { label: 'Azul',       value: '#2563EB' },
    { label: 'Teal',       value: '#0D9488' },
    { label: 'Verde',      value: '#16A34A' },
    { label: 'Morado',     value: '#7C3AED' },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function RichTextEditor({ value = '', onChange, isDark: isDarkProp, placeholder = 'Escribí la descripción del producto...' }) {
    const { isDark: isDarkCtx } = useTheme();
    const isDark = isDarkProp !== undefined ? isDarkProp : isDarkCtx;
    const colorInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, bulletList: false, orderedList: false,
                blockquote: false, code: false, codeBlock: false,
            }),
            Underline,
            TextStyleExtended,
            Color,
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'outline-none min-h-[160px] px-4 py-3 leading-relaxed',
            },
        },
    });

    if (!editor) return null;

    const activeFontSize = editor.getAttributes('textStyle').fontSize ?? '';
    const activeColor    = editor.getAttributes('textStyle').color ?? '';

    const applyFontSize = (val) => {
        if (!val) {
            // unset: remove fontSize but keep other textStyle attrs
            editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
        } else {
            editor.chain().focus().setMark('textStyle', { fontSize: val }).run();
        }
    };

    return (
        <div className={`rounded-xl border overflow-hidden transition-all
            ${isDark
                ? 'bg-slate-800 border-slate-700 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20'
                : 'bg-slate-50 border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/15 focus-within:bg-white'
            }`}
        >
            {/* ── Toolbar ── */}
            <div className={`flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b
                ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}
            >
                <ToolbarButton isDark={isDark} title="Negrita (Ctrl+B)"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                >
                    <Bold size={13} strokeWidth={2.5} />
                </ToolbarButton>

                <ToolbarButton isDark={isDark} title="Cursiva (Ctrl+I)"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                >
                    <Italic size={13} strokeWidth={2.5} />
                </ToolbarButton>

                <ToolbarButton isDark={isDark} title="Subrayado (Ctrl+U)"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                >
                    <UnderlineIcon size={13} strokeWidth={2.5} />
                </ToolbarButton>

                <Divider isDark={isDark} />

                {/* Font size */}
                <div className="relative">
                    <select
                        value={activeFontSize}
                        onChange={e => applyFontSize(e.target.value)}
                        className={`h-7 pl-2 pr-6 rounded-lg text-xs font-medium border outline-none appearance-none cursor-pointer transition-colors
                            ${isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <option value="">Tamaño</option>
                        {FONT_SIZES.map(s => (
                            <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
                        ))}
                    </select>
                    <ChevronDown size={10} className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>

                <Divider isDark={isDark} />

                {/* Color swatches + custom picker */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        title="Color personalizado"
                        onClick={() => colorInputRef.current?.click()}
                        className={`h-7 flex items-center gap-1.5 px-2 rounded-lg text-xs font-bold border transition-colors
                            ${isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <span className="font-black text-sm leading-none"
                            style={{ color: activeColor || (isDark ? '#e2e8f0' : '#1e293b') }}>A</span>
                        <div className="w-3.5 h-1.5 rounded-sm"
                            style={{ background: activeColor || (isDark ? '#e2e8f0' : '#1e293b') }} />
                    </button>

                    <div className="flex items-center gap-0.5">
                        {COLORS.map(c => (
                            <button
                                key={c.value}
                                type="button"
                                title={c.label}
                                onClick={() => editor.chain().focus().setColor(c.value).run()}
                                className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110
                                    ${activeColor === c.value ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                                style={{ background: c.value }}
                            />
                        ))}
                    </div>

                    <input
                        ref={colorInputRef}
                        type="color"
                        value={activeColor || '#000000'}
                        onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                        className="sr-only"
                    />
                </div>
            </div>

            {/* ── Editor area ── */}
            <div
                className={`${isDark ? 'text-slate-200' : 'text-slate-900'} rich-editor`}
                onClick={() => editor.commands.focus()}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
