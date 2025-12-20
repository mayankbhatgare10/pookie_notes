'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import { useState, useEffect, useRef } from 'react';
import { TagNode } from './TagNode';
import EditorToolbar from './editor/EditorToolbar';
import ExportMenu from './editor/ExportMenu';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    note?: any;
    onSave?: (noteId: string, title: string, content: string) => void;
    onDelete?: (noteId: string) => void;
    collectionTags?: string[];
}

export default function NoteEditor({ isOpen, onClose, note, onSave, onDelete, collectionTags = [] }: NoteEditorProps) {
    const [title, setTitle] = useState(note?.title || 'Untitled');
    const [isEditing, setIsEditing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [fontSize, setFontSize] = useState('16');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const [commandSearch, setCommandSearch] = useState('');
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [exportButtonRef, setExportButtonRef] = useState<HTMLButtonElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);

    // Only show tags if the note belongs to a collection that has tags
    const availableTags = collectionTags || [];

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline, TextStyle, Color,
            Highlight.configure({ multicolor: true, HTMLAttributes: { class: 'highlighted-text' } }),
            FontFamily,
            Placeholder.configure({ placeholder: isEditing ? "Start typing or use '/' for commands..." : "Click Edit to start writing..." }),
            Link.configure({ openOnClick: false }),
            TaskList, TaskItem.configure({ nested: true, HTMLAttributes: { class: 'task-item' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            CodeBlock,
            Image.configure({ inline: true, allowBase64: true }),
            TagNode,
        ],
        editable: isEditing,
        content: note?.content || '',
        immediatelyRender: false,
        editorProps: { attributes: { class: 'prose prose-lg max-w-none focus:outline-none min-h-[450px]' } },
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);

            // Command menu logic
            if (isEditing) {
                const { from } = editor.state.selection;
                const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, '\n');
                if (textBefore.endsWith('/') || textBefore.match(/\/(\w*)$/)) {
                    const match = textBefore.match(/\/(\w*)$/);
                    setCommandSearch(match ? match[1] : '');
                    setShowCommandMenu(true);
                    const coords = editor.view.coordsAtPos(from);
                    setMenuPosition({ top: coords.top + 20, left: coords.left });
                } else {
                    setShowCommandMenu(false);
                }
            } else {
                setShowCommandMenu(false);
            }
        },
    });

    useEffect(() => {
        if (!isOpen) {
            editor?.commands.setContent('');
            setTitle('Untitled');
            setWordCount(0);
            setIsEditing(false);
        } else if (note) {
            // Update title when note changes
            setTitle(note.title || 'Untitled');
            if (note.content) {
                editor?.commands.setContent(note.content);
                setIsEditing(false);
            } else {
                setIsEditing(true);
            }
        }
    }, [isOpen, editor, note?.id]); // Use note.id to detect note changes

    useEffect(() => { editor?.setEditable(isEditing); }, [isEditing, editor]);

    // Drawing Logic
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
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    };

    const insertDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        editor?.chain().focus().setImage({ src: dataUrl }).run();
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        setIsDrawing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#fffef5] to-[#f5f4e8] rounded-[20px] md:rounded-[32px] w-full max-w-5xl max-h-[95vh] md:max-h-[92vh] shadow-2xl flex flex-col border-2 border-black/5 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b-2 border-black/5 bg-white/50 backdrop-blur-sm rounded-t-[18px] md:rounded-t-[30px]">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give it a cool name..."
                        className="text-lg md:text-2xl font-bold text-black bg-transparent focus:outline-none w-full max-w-[200px] md:max-w-[320px] placeholder:text-black/30"
                    />
                    <div className="flex items-center gap-1 md:gap-2">
                        <button
                            onClick={() => {
                                if (isEditing && note && onSave) {
                                    onSave(note.id, title, editor?.getHTML() || '');
                                    setIsEditing(false);
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className="px-3 md:px-5 py-1.5 md:py-2.5 bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-xs md:text-sm rounded-xl md:rounded-2xl transition-colors shadow-md flex items-center gap-1 md:gap-2"
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </button>

                        <div className="relative hidden md:block">
                            <button ref={setExportButtonRef} onClick={() => setShowExportMenu(true)} className="p-2.5 hover:bg-black/5 rounded-xl transition-colors">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </button>
                            <ExportMenu
                                editor={editor}
                                title={title}
                                wordCount={wordCount}
                                isOpen={showExportMenu}
                                onClose={() => setShowExportMenu(false)}
                                position={exportButtonRef ? { top: exportButtonRef.getBoundingClientRect().bottom + 8, left: exportButtonRef.getBoundingClientRect().left } : { top: 0, left: 0 }}
                            />
                        </div>

                        <button onClick={() => { if (note && onDelete) onDelete(note.id); }} className="p-1.5 md:p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors hidden md:block">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button onClick={onClose} className="p-1.5 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <EditorToolbar
                        editor={editor}
                        fontFamily={fontFamily} setFontFamily={setFontFamily}
                        fontSize={fontSize} setFontSize={setFontSize}
                        isDrawing={isDrawing} setIsDrawing={setIsDrawing}
                    />
                )}

                {/* Quick Tags */}
                {availableTags.length > 0 && (
                    <div className="px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm border-b-2 border-black/5">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                            <span className="text-xs md:text-sm font-bold text-black/60">Quick Tags:</span>
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => editor?.chain().focus().insertContent({ type: 'tag', attrs: { label: tag } }).run()}
                                    className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-white hover:bg-[#f5f4e8] text-black/70 font-medium rounded-full transition-colors border border-black/10 hover:border-[#ffd700]"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-10 py-4 md:py-8 bg-white relative">
                    <div className="max-w-4xl mx-auto">
                        {isDrawing && (
                            <div className="mb-4 p-3 md:p-4 bg-[#fffef5] rounded-xl md:rounded-2xl border-2 border-[#ffd700]">
                                <canvas
                                    ref={canvasRef}
                                    width={800} height={200}
                                    className="w-full border-2 border-dashed border-black/20 rounded-xl cursor-crosshair bg-white"
                                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsCanvasDrawing(false)} onMouseLeave={() => setIsCanvasDrawing(false)}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 800, 200)} className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium">Clear</button>
                                    <button onClick={insertDrawing} className="px-3 py-1 text-xs bg-[#ffd700] hover:bg-[#ffed4e] text-black rounded-lg transition-colors font-semibold">Insert</button>
                                </div>
                            </div>
                        )}
                        <EditorContent editor={editor} style={{ fontSize: `${fontSize}px`, fontFamily }} />
                    </div>
                </div>

                <div className="px-4 md:px-8 py-3 md:py-4 border-t-2 border-black/5 flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-b-[18px] md:rounded-b-[30px]">
                    <div className="flex items-center gap-3 md:gap-6">
                        <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"><span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span><span className="font-medium text-black/60">Auto-saved</span></span>
                        <span className="text-xs md:text-sm text-black/60 font-medium">{wordCount} words</span>
                    </div>
                    <span className="text-xs md:text-sm text-black/40 font-medium hidden md:inline">Press / for commands</span>
                </div>
            </div>
        </div>
    );
}
