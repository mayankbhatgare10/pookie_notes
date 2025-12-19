'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import { useState, useEffect, useRef } from 'react';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    noteTitle?: string;
    noteColor?: string;
}

export default function NoteEditor({ isOpen, onClose, noteTitle = 'Untitled', noteColor = '#e8d4ff' }: NoteEditorProps) {
    const [title, setTitle] = useState(noteTitle);
    const [wordCount, setWordCount] = useState(0);
    const [fontSize, setFontSize] = useState('16');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const [commandSearch, setCommandSearch] = useState('');
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);

    const availableTags = ['Romance', 'Thriller', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Anime'];

    const textColors = [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Pink', value: '#ec4899' },
    ];

    const highlightColors = [
        { name: 'Yellow', value: '#fef08a' },
        { name: 'Green', value: '#bbf7d0' },
        { name: 'Blue', value: '#bfdbfe' },
        { name: 'Pink', value: '#fbcfe8' },
        { name: 'Orange', value: '#fed7aa' },
        { name: 'Purple', value: '#e9d5ff' },
    ];

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Heading.configure({
                levels: [1, 2, 3],
            }),
            Bold,
            Italic,
            Underline,
            Placeholder.configure({
                placeholder: "Start typing or use '/' for commands...",
            }),
            Link.configure({
                openOnClick: false,
            }),
            BulletList,
            OrderedList,
            ListItem,
            TaskList,
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'task-item',
                },
            }),
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Blockquote,
            CodeBlock,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[450px]',
            },
        },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);

            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n');

            if (textBefore.endsWith('/')) {
                setShowCommandMenu(true);
                setCommandSearch('');
                const coords = editor.view.coordsAtPos(from);
                setMenuPosition({ top: coords.top + 20, left: coords.left });
            } else if (textBefore.match(/\/(\w*)$/)) {
                const match = textBefore.match(/\/(\w*)$/);
                setCommandSearch(match ? match[1] : '');
                setShowCommandMenu(true);
                const coords = editor.view.coordsAtPos(from);
                setMenuPosition({ top: coords.top + 20, left: coords.left });
            } else {
                setShowCommandMenu(false);
            }
        },
    });

    const commands = [
        { name: 'Heading 1', desc: 'Big heading', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
        { name: 'Heading 2', desc: 'Medium heading', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
        { name: 'Heading 3', desc: 'Small heading', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
        { name: 'Bullet List', desc: 'Simple list', action: () => editor?.chain().focus().toggleBulletList().run() },
        { name: 'Numbered List', desc: 'Numbered list', action: () => editor?.chain().focus().toggleOrderedList().run() },
        { name: 'Task List', desc: 'To-do list', action: () => editor?.chain().focus().toggleTaskList().run() },
        { name: 'Quote', desc: 'Quote block', action: () => editor?.chain().focus().toggleBlockquote().run() },
        { name: 'Code', desc: 'Code block', action: () => editor?.chain().focus().toggleCodeBlock().run() },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(commandSearch.toLowerCase())
    );

    const executeCommand = (action: () => void) => {
        const { from } = editor!.state.selection;
        const textBefore = editor!.state.doc.textBetween(Math.max(0, from - 20), from, '\n');
        const match = textBefore.match(/\/(\w*)$/);
        if (match) {
            const matchLength = match[0].length;
            editor?.chain().focus().deleteRange({ from: from - matchLength, to: from }).run();
        }
        action();
        setShowCommandMenu(false);
    };

    const insertTag = (tag: string) => {
        // Insert tag as a styled span with X button
        const tagHTML = `<span contenteditable="false" style="display: inline-flex; align-items: center; gap: 6px; background: #e8d4ff; color: #000; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: 500; margin: 0 4px;"><span>${tag}</span><button onclick="this.parentElement.remove()" style="display: flex; align-items: center; justify-content: center; width: 14px; height: 14px; padding: 0; background: transparent; border: none; cursor: pointer; border-radius: 999px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='transparent'"><svg style="width: 10px; height: 10px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></span>&nbsp;`;
        editor?.chain().focus().insertContent(tagHTML).run();
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsCanvasDrawing(true);
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCanvasDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsCanvasDrawing(false);
    };

    const insertDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        editor?.chain().focus().setImage({ src: dataUrl }).run();

        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setIsDrawing(false);
    };

    useEffect(() => {
        if (!isOpen) {
            editor?.commands.setContent('');
            setTitle(noteTitle);
            setWordCount(0);
        }
    }, [isOpen, editor, noteTitle]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showCommandMenu && e.key === 'Escape') {
                setShowCommandMenu(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showCommandMenu]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#fffef5] to-[#f5f4e8] rounded-[32px] w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col border-2 border-black/5 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b-2 border-black/5 bg-white/50 backdrop-blur-sm rounded-t-[30px]">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-black/10"
                            style={{ backgroundColor: noteColor }}
                        >
                            📝
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give it a cool name..."
                            className="text-2xl font-bold text-black bg-transparent focus:outline-none w-80 placeholder:text-black/30"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-5 py-2.5 bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-sm rounded-2xl transition-colors shadow-md flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save
                        </button>

                        <button className="p-2.5 hover:bg-black/5 rounded-xl transition-colors" title="Share">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>

                        <button className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors" title="Delete">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        <button onClick={onClose} className="p-2.5 hover:bg-black/5 rounded-xl transition-colors">
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 border-b-2 border-black/5 flex items-center gap-3 flex-wrap bg-white/70 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <select
                            value={fontFamily}
                            onChange={(e) => {
                                setFontFamily(e.target.value);
                                editor?.chain().focus().setFontFamily(e.target.value).run();
                            }}
                            className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#ffd700] transition-colors cursor-pointer"
                        >
                            <option value="Inter">Inter</option>
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Comic Sans MS">Comic Sans</option>
                        </select>

                        <select
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                            className="px-4 py-2 bg-white border border-[#e0e0e0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#ffd700] transition-colors cursor-pointer"
                        >
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="18">18px</option>
                            <option value="20">20px</option>
                            <option value="24">24px</option>
                        </select>
                    </div>

                    <div className="h-8 w-px bg-black/10"></div>

                    <div className="flex items-center gap-1">
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                editor?.chain().focus().toggleBold().run();
                            }}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${editor?.isActive('bold') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        >
                            <span className="font-bold text-sm">B</span>
                        </button>
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                editor?.chain().focus().toggleItalic().run();
                            }}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${editor?.isActive('italic') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        >
                            <span className="italic text-sm">I</span>
                        </button>
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                editor?.chain().focus().toggleUnderline().run();
                            }}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${editor?.isActive('underline') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        >
                            <span className="underline text-sm">U</span>
                        </button>
                    </div>

                    <div className="h-8 w-px bg-black/10"></div>

                    {/* Text Color */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowColorPicker(!showColorPicker);
                                setShowHighlightPicker(false);
                            }}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors flex items-center gap-1.5"
                            title="Text Color"
                        >
                            <div className="w-5 h-5 rounded border-2 border-black/20" style={{ backgroundColor: editor?.getAttributes('textStyle').color || '#000000' }}></div>
                            <span className="text-xs font-medium">A</span>
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-12 left-0 bg-white rounded-xl shadow-xl border border-black/10 p-3 z-50">
                                <div className="text-xs font-semibold text-black/60 mb-2">Text Color</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {textColors.map((color) => (
                                        <button
                                            key={color.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editor?.chain().focus().setColor(color.value).run();
                                                setShowColorPicker(false);
                                            }}
                                            className="w-8 h-8 rounded-lg border-2 border-black/10 transition-colors"
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Highlight Color */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowHighlightPicker(!showHighlightPicker);
                                setShowColorPicker(false);
                            }}
                            className="p-2 rounded-lg hover:bg-black/5 transition-colors flex items-center gap-1.5"
                            title="Highlight"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        {showHighlightPicker && (
                            <div className="absolute top-12 left-0 bg-white rounded-xl shadow-xl border border-black/10 p-3 z-50">
                                <div className="text-xs font-semibold text-black/60 mb-2">Highlight Color</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {highlightColors.map((color) => (
                                        <button
                                            key={color.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editor?.chain().focus().toggleHighlight({ color: color.value }).run();
                                                setShowHighlightPicker(false);
                                            }}
                                            className="w-10 h-10 rounded-lg border-2 border-black/10 transition-colors"
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-black/10"></div>

                    <div className="flex items-center gap-1">
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                editor?.chain().focus().toggleBulletList().run();
                            }}
                            className={`p-2 rounded-lg transition-colors ${editor?.isActive('bulletList') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                editor?.chain().focus().toggleOrderedList().run();
                            }}
                            className={`p-2 rounded-lg transition-colors ${editor?.isActive('orderedList') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        >
                            <span className="text-sm font-bold">1.</span>
                        </button>
                        <button
                            onMouseDown={(e) => {
                                e.preventDefault();
                                editor?.chain().focus().toggleTaskList().run();
                            }}
                            className={`p-2 rounded-lg transition-colors ${editor?.isActive('taskList') ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </button>
                    </div>

                    <div className="h-8 w-px bg-black/10"></div>

                    <button
                        onClick={() => setIsDrawing(!isDrawing)}
                        className={`p-2 rounded-lg transition-colors ${isDrawing ? 'bg-[#ffd700]' : 'hover:bg-black/5'}`}
                        title="Handwriting"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>

                {/* Tags Section */}
                <div className="px-8 py-4 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border-b-2 border-black/5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-black/60">Insert Tags:</span>
                        {availableTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => insertTag(tag)}
                                className="px-4 py-2 text-sm bg-white hover:bg-[#f5f4e8] text-black/70 font-medium rounded-full transition-colors border border-black/10"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-white relative">
                    <div className="max-w-4xl mx-auto">
                        {isDrawing && (
                            <div className="mb-4 p-4 bg-[#fffef5] rounded-2xl border-2 border-[#ffd700]">
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={200}
                                    className="w-full border-2 border-dashed border-black/20 rounded-xl cursor-crosshair bg-white"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => {
                                            const canvas = canvasRef.current;
                                            if (!canvas) return;
                                            const ctx = canvas.getContext('2d');
                                            ctx?.clearRect(0, 0, canvas.width, canvas.height);
                                        }}
                                        className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={insertDrawing}
                                        className="px-3 py-1 text-xs bg-[#ffd700] hover:bg-[#ffed4e] text-black rounded-lg transition-colors font-semibold"
                                    >
                                        Insert Drawing
                                    </button>
                                </div>
                            </div>
                        )}

                        <EditorContent
                            editor={editor}
                            style={{ fontSize: `${fontSize}px`, fontFamily }}
                        />

                        {showCommandMenu && filteredCommands.length > 0 && (
                            <div
                                className="fixed bg-white border-2 border-black/10 rounded-2xl shadow-2xl p-2 w-72 z-[100]"
                                style={{
                                    top: `${Math.min(menuPosition.top, window.innerHeight - 400)}px`,
                                    left: `${Math.min(menuPosition.left, window.innerWidth - 300)}px`
                                }}
                            >
                                <div className="text-xs text-black/40 px-3 py-2 font-semibold">COMMANDS</div>
                                {filteredCommands.map((cmd, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => executeCommand(cmd.action)}
                                        className="w-full text-left px-4 py-3 hover:bg-[#ffd700]/20 rounded-xl transition-colors"
                                    >
                                        <div className="text-sm font-semibold text-black">{cmd.name}</div>
                                        <div className="text-xs text-black/50">{cmd.desc}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t-2 border-black/5 flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-b-[30px]">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="font-medium text-black/60">Auto-saved</span>
                        </span>
                        <span className="text-sm text-black/60 font-medium">{wordCount} words</span>
                    </div>
                    <span className="text-sm text-black/40 font-medium">Press / for commands</span>
                </div>
            </div>
        </div>
    );
}
