
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
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[999998] bg-black/50 md:bg-transparent animate-modal-backdrop md:animate-none"
                onClick={onClose}
            />

            {/* Menu - Bottom sheet on mobile, dropdown on desktop */}
            <div
                className="fixed md:absolute bg-white rounded-t-2xl md:rounded-xl shadow-2xl md:shadow-xl border-t-2 md:border border-black/10 z-[999999] 
                           bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-auto w-full md:w-auto md:min-w-[200px]
                           animate-slide-up md:animate-none"
                style={{
                    top: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${position.top}px` : undefined,
                    left: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${position.left}px` : undefined
                }}
            >
                {/* Mobile Handle */}
                <div className="md:hidden flex justify-center py-2">
                    <div className="w-12 h-1 bg-black/20 rounded-full" />
                </div>

                {/* Title - Mobile only */}
                <div className="md:hidden px-4 pb-2">
                    <h3 className="font-bold text-lg">Export Note</h3>
                </div>

                {/* Export Options */}
                <div className="py-2">
                    <button
                        onClick={exportToPDF}
                        className="w-full px-4 md:px-4 py-3 md:py-2.5 text-left text-base md:text-sm hover:bg-black/5 transition-colors flex items-center gap-3 tap-target"
                    >
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Export as PDF</span>
                    </button>
                    <button
                        onClick={exportToWord}
                        className="w-full px-4 md:px-4 py-3 md:py-2.5 text-left text-base md:text-sm hover:bg-black/5 transition-colors flex items-center gap-3 tap-target"
                    >
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">Export as Word</span>
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="w-full px-4 md:px-4 py-3 md:py-2.5 text-left text-base md:text-sm hover:bg-black/5 transition-colors flex items-center gap-3 tap-target"
                    >
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">Export as CSV</span>
                    </button>
                </div>

                {/* Cancel button - Mobile only */}
                <div className="md:hidden border-t border-black/10 p-4">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-black/5 hover:bg-black/10 rounded-xl font-semibold transition-colors tap-target"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}
