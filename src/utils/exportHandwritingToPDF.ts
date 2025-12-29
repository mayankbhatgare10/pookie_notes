import jsPDF from 'jspdf';
import { loadHandwritingBlock } from '@/lib/handwritingService';
import { HandwritingBlockData } from '@/types/handwriting';

/**
 * Recreate a Konva stage from handwriting block data for export
 */
async function recreateKonvaStage(
    blockData: HandwritingBlockData
): Promise<any> {
    const { loadKonvaModules } = await import('@/utils/lazyLoadKonva');
    const { konva } = await loadKonvaModules();

    // Create off-screen stage
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const stage = new konva.Stage({
        container,
        width: blockData.width,
        height: blockData.height,
    });

    const layer = new konva.Layer();
    stage.add(layer);

    // Render strokes
    blockData.strokes.forEach((stroke) => {
        const line = new konva.Line({
            points: stroke.points,
            stroke: stroke.color,
            strokeWidth: stroke.width,
            tension: stroke.tension,
            lineCap: stroke.lineCap,
            lineJoin: stroke.lineJoin,
            globalCompositeOperation:
                stroke.tool === 'eraser' ? 'destination-out' : 'source-over',
        });
        layer.add(line);
    });

    layer.batchDraw();

    return { stage, container };
}

/**
 * Export note to PDF with handwriting blocks
 */
export async function exportNoteToPDF(
    userId: string,
    noteId: string,
    noteTitle: string,
    editorHTML: string
): Promise<void> {
    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        let yOffset = margin;

        // Add title
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(noteTitle, margin, yOffset);
        yOffset += 12;

        // Parse HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(editorHTML, 'text/html');

        // Process each element
        for (const element of Array.from(doc.body.children)) {
            // Check if we need a new page
            if (yOffset > pageHeight - margin - 20) {
                pdf.addPage();
                yOffset = margin;
            }

            if (element.getAttribute('data-type') === 'handwriting-block') {
                // Handle handwriting block
                const blockId = element.getAttribute('data-block-id');
                if (!blockId) continue;

                const blockData = await loadHandwritingBlock(userId, noteId, blockId);
                if (!blockData) continue;

                // Render Konva to PNG
                const { stage, container } = await recreateKonvaStage(blockData);
                const dataURL = stage.toDataURL({ pixelRatio: 2 });

                // Calculate dimensions to fit page
                const aspectRatio = blockData.height / blockData.width;
                const imageWidth = contentWidth;
                const imageHeight = imageWidth * aspectRatio;

                // Add to PDF
                pdf.addImage(dataURL, 'PNG', margin, yOffset, imageWidth, imageHeight);
                yOffset += imageHeight + 5;

                // Cleanup
                stage.destroy();
                document.body.removeChild(container);
            } else {
                // Handle text content
                const text = element.textContent?.trim() || '';
                if (!text) continue;

                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');

                // Handle different element types
                if (element.tagName === 'H1') {
                    pdf.setFontSize(18);
                    pdf.setFont('helvetica', 'bold');
                } else if (element.tagName === 'H2') {
                    pdf.setFontSize(16);
                    pdf.setFont('helvetica', 'bold');
                } else if (element.tagName === 'H3') {
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                }

                // Split text to fit page width
                const lines = pdf.splitTextToSize(text, contentWidth);

                // Check if text fits on current page
                const textHeight = lines.length * 7;
                if (yOffset + textHeight > pageHeight - margin) {
                    pdf.addPage();
                    yOffset = margin;
                }

                pdf.text(lines, margin, yOffset);
                yOffset += textHeight + 3;
            }
        }

        // Save PDF
        pdf.save(`${noteTitle}.pdf`);
        console.log('✅ PDF exported successfully');
    } catch (error) {
        console.error('❌ Error exporting to PDF:', error);
        throw error;
    }
}

/**
 * Export handwriting block to PNG (for standalone export)
 */
export async function exportHandwritingBlockToPNG(
    userId: string,
    noteId: string,
    blockId: string,
    filename: string
): Promise<void> {
    try {
        const blockData = await loadHandwritingBlock(userId, noteId, blockId);
        if (!blockData) {
            throw new Error('Handwriting block not found');
        }

        const { stage, container } = await recreateKonvaStage(blockData);
        const dataURL = stage.toDataURL({ pixelRatio: 3 }); // High resolution

        // Download
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataURL;
        link.click();

        // Cleanup
        stage.destroy();
        document.body.removeChild(container);

        console.log('✅ PNG exported successfully');
    } catch (error) {
        console.error('❌ Error exporting to PNG:', error);
        throw error;
    }
}

/**
 * Export handwriting block to SVG (vector format)
 */
export async function exportHandwritingBlockToSVG(
    userId: string,
    noteId: string,
    blockId: string,
    filename: string
): Promise<void> {
    try {
        const blockData = await loadHandwritingBlock(userId, noteId, blockId);
        if (!blockData) {
            throw new Error('Handwriting block not found');
        }

        const { stage, container } = await recreateKonvaStage(blockData);

        // Export to SVG
        const svgString = stage.toDataURL({ mimeType: 'image/svg+xml' });

        // Download
        const link = document.createElement('a');
        link.download = `${filename}.svg`;
        link.href = svgString;
        link.click();

        // Cleanup
        stage.destroy();
        document.body.removeChild(container);

        console.log('✅ SVG exported successfully');
    } catch (error) {
        console.error('❌ Error exporting to SVG:', error);
        throw error;
    }
}
