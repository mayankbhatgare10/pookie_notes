'use client';

import { useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface CommandMenuProps {
    isOpen: boolean;
    position: { top: number; left: number };
    search: string;
    editor: Editor | null;
    onClose: () => void;
}

interface Command {
    title: string;
    description: string;
    icon: string;
    action: () => void;
}

export default function CommandMenu({ isOpen, position, search, editor, onClose }: CommandMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    const commands: Command[] = [
        {
            title: 'Heading 1',
            description: 'Big section heading',
            icon: 'H1',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleHeading({ level: 1 }).run();
                onClose();
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading',
            icon: 'H2',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleHeading({ level: 2 }).run();
                onClose();
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading',
            icon: 'H3',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleHeading({ level: 3 }).run();
                onClose();
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bullet list',
            icon: '•',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleBulletList().run();
                onClose();
            },
        },
        {
            title: 'Numbered List',
            description: 'Create a numbered list',
            icon: '1.',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleOrderedList().run();
                onClose();
            },
        },
        {
            title: 'Task List',
            description: 'Track tasks with checkboxes',
            icon: '☑',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleTaskList().run();
                onClose();
            },
        },
        {
            title: 'Code Block',
            description: 'Insert a code snippet',
            icon: '</>',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleCodeBlock().run();
                onClose();
            },
        },
        {
            title: 'Quote',
            description: 'Add a blockquote',
            icon: '"',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).toggleBlockquote().run();
                onClose();
            },
        },
        {
            title: 'Divider',
            description: 'Add a horizontal line',
            icon: '—',
            action: () => {
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).setHorizontalRule().run();
                onClose();
            },
        },
        {
            title: 'Handwriting Block',
            description: 'Draw with pen or stylus',
            icon: '✍️',
            action: () => {
                const blockId = `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                editor?.chain().focus().deleteRange({ from: editor.state.selection.from - search.length - 1, to: editor.state.selection.from }).insertHandwritingBlock({ blockId, width: 800, height: 400 }).run();
                onClose();
            },
        },
    ];

    const filteredCommands = commands.filter(
        (cmd) =>
            cmd.title.toLowerCase().includes(search.toLowerCase()) ||
            cmd.description.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || filteredCommands.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-xl shadow-2xl border-2 border-black/10 py-2 z-[100] min-w-[280px] max-h-[320px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <div className="px-3 py-2 border-b border-black/5">
                <p className="text-xs font-bold text-black/40 uppercase tracking-wider">Commands</p>
            </div>
            {filteredCommands.map((command, index) => (
                <button
                    key={index}
                    onClick={command.action}
                    className="w-full px-4 py-3 hover:bg-[#ffd700]/20 transition-colors flex items-center gap-3 text-left group"
                >
                    <div className="w-8 h-8 rounded-lg bg-[#f5f4e8] group-hover:bg-[#ffd700] flex items-center justify-center font-bold text-sm transition-colors">
                        {command.icon}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-black">{command.title}</p>
                        <p className="text-xs text-black/50">{command.description}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}
