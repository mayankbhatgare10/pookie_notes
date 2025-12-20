
'use client';

import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { useState, useRef, useEffect } from 'react';

interface ExportMenuProps {
    editor: Editor | null;
    title: string;
    wordCount: number;
    showExportMenu: boolean;
    setShowExportMenu: (show: boolean) => void;
    // ... we need button ref or position to position the menu
    // Actually simpler: passing the position or ref.
    // In original code, it used state for position.
}

// ... actually, encapsulating the logic inside ExportMenu might be better. 
// Pass 'onClose' and render it.

export default function ExportMenu({ editor, title, wordCount, isOpen, onClose, position }: {
    editor: Editor | null,
    title: string,
    wordCount: number,
    isOpen: boolean,
    onClose: () => void,
    position: { top: number, left: number }
}) {
    if (!isOpen || typeof window === 'undefined') return null;

    const exportToPDF = async () => {
        if (!editor) return;
        const { jsPDF } = await import('jspdf'); // Dynamic import
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(title, 20, 20);
        doc.setFontSize(12);
        const content = editor.getText();
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 20, 40);
        doc.save(`${title}.pdf`);
        onClose();
    };

    const exportToWord = () => {
        if (!editor) return;
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>${title}</title></head>
            <body><h1>${title}</h1>${editor.getHTML()}</body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.doc`;
        link.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    const exportToCSV = () => {
        if (!editor) return;
        const csvContent = `Title,Content,Word Count\n"${title}","${editor.getText().replace(/"/g, '""')}",${wordCount}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    return createPortal(
        <>
            <div className="fixed inset-0 z-[999998]" onClick={onClose} />
            <div
                className="fixed bg-white rounded-xl shadow-xl border border-black/10 py-2 z-[999999] min-w-[160px]"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            >
                <button onClick={exportToPDF} className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 transition-colors flex items-center gap-3">
                    <span className="font-medium">Export as PDF</span>
                </button>
                <button onClick={exportToWord} className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 transition-colors flex items-center gap-3">
                    <span className="font-medium">Export as Word</span>
                </button>
                <button onClick={exportToCSV} className="w-full px-4 py-2.5 text-left text-sm hover:bg-black/5 transition-colors flex items-center gap-3">
                    <span className="font-medium">Export as CSV</span>
                </button>
            </div>
        </>,
        document.body
    );
}
