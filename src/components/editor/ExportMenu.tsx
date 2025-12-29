
'use client';

import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';

export default function ExportMenu({ editor, title, wordCount, isOpen, onClose, position, inkCanvasRef }: {
    editor: Editor | null,
    title: string,
    wordCount: number,
    isOpen: boolean,
    onClose: () => void,
    position: { top: number, left: number },
    inkCanvasRef?: React.RefObject<any>
}) {
    if (!isOpen || typeof window === 'undefined') return null;

    const exportToPDF = async () => {
        if (!editor) return;

        try {
            // Import libraries
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;

            // Find the editor content element
            const editorElement = document.querySelector('.ProseMirror');
            if (!editorElement) {
                console.error('Editor element not found');
                return;
            }

            // Create a temporary container with both content and ink
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '800px';
            container.style.background = 'white';
            container.style.padding = '40px';

            // Add title
            const titleEl = document.createElement('h1');
            titleEl.textContent = title;
            titleEl.style.fontSize = '24px';
            titleEl.style.marginBottom = '20px';
            container.appendChild(titleEl);

            // Clone editor content
            const contentClone = editorElement.cloneNode(true) as HTMLElement;
            container.appendChild(contentClone);

            // Add ink layer if available
            if (inkCanvasRef?.current) {
                const inkImageData = inkCanvasRef.current.exportToPNG();
                if (inkImageData) {
                    const inkImg = document.createElement('img');
                    inkImg.src = inkImageData;
                    inkImg.style.position = 'absolute';
                    inkImg.style.top = '80px'; // After title
                    inkImg.style.left = '40px';
                    inkImg.style.width = '720px';
                    inkImg.style.pointerEvents = 'none';
                    container.appendChild(inkImg);
                }
            }

            document.body.appendChild(container);

            // Capture as canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });

            // Remove temporary container
            document.body.removeChild(container);

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${title}.pdf`);

        } catch (error) {
            console.error('Failed to export PDF:', error);
        }

        onClose();
    };

    const exportToWord = () => {
        if (!editor) return;

        let inkImageHtml = '';

        // Add ink layer if available
        if (inkCanvasRef?.current) {
            try {
                const inkImageData = inkCanvasRef.current.exportToPNG();
                if (inkImageData) {
                    inkImageHtml = `<img src="${inkImageData}" style="position: absolute; top: 0; left: 0; width: 100%; height: auto; pointer-events: none; z-index: 10;" />`;
                }
            } catch (error) {
                console.error('Failed to add ink layer to Word:', error);
            }
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h1 { font-size: 24px; margin-bottom: 20px; }
                    .content-wrapper { position: relative; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="content-wrapper">
                    ${editor.getHTML()}
                    ${inkImageHtml}
                </div>
            </body>
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
