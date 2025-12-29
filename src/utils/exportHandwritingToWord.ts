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
 * Export note to Word (.docx) with handwriting blocks
 * Uses HTML format with embedded base64 images
 */
export async function exportNoteToWord(
    userId: string,
    noteId: string,
    noteTitle: string,
    editorHTML: string
): Promise<void> {
    try {
        let htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${noteTitle}</title>
  <style>
    body {
      font-family: 'Calibri', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      margin: 1in;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 12pt;
    }
    h2 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 10pt;
    }
    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 8pt;
    }
    p {
      margin-bottom: 6pt;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 12pt 0;
    }
    .handwriting-block {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <h1>${noteTitle}</h1>
`;

        // Parse HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(editorHTML, 'text/html');

        // Process each element
        for (const element of Array.from(doc.body.children)) {
            if (element.getAttribute('data-type') === 'handwriting-block') {
                // Handle handwriting block
                const blockId = element.getAttribute('data-block-id');
                if (!blockId) continue;

                const blockData = await loadHandwritingBlock(userId, noteId, blockId);
                if (!blockData) continue;

                // Render Konva to PNG
                const { stage, container } = await recreateKonvaStage(blockData);
                const dataURL = stage.toDataURL({ pixelRatio: 2 });

                // Embed as image
                htmlContent += `<div class="handwriting-block"><img src="${dataURL}" alt="Handwriting" /></div>`;

                // Cleanup
                stage.destroy();
                document.body.removeChild(container);
            } else {
                // Add text content as-is
                htmlContent += element.outerHTML;
            }
        }

        htmlContent += `
</body>
</html>
`;

        // Create blob with Word MIME type
        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/vnd.ms-word',
        });

        // Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${noteTitle}.doc`;
        link.click();

        // Cleanup
        URL.revokeObjectURL(link.href);

        console.log('✅ Word document exported successfully');
    } catch (error) {
        console.error('❌ Error exporting to Word:', error);
        throw error;
    }
}

/**
 * Export note to HTML with embedded handwriting
 */
export async function exportNoteToHTML(
    userId: string,
    noteId: string,
    noteTitle: string,
    editorHTML: string
): Promise<void> {
    try {
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>${noteTitle}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; margin-bottom: 0.5em; }
    h3 { font-size: 1.25em; margin-bottom: 0.5em; }
    img {
      max-width: 100%;
      height: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin: 16px 0;
    }
    .handwriting-block {
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>${noteTitle}</h1>
`;

        // Parse HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(editorHTML, 'text/html');

        // Process each element
        for (const element of Array.from(doc.body.children)) {
            if (element.getAttribute('data-type') === 'handwriting-block') {
                // Handle handwriting block
                const blockId = element.getAttribute('data-block-id');
                if (!blockId) continue;

                const blockData = await loadHandwritingBlock(userId, noteId, blockId);
                if (!blockData) continue;

                // Render Konva to PNG
                const { stage, container } = await recreateKonvaStage(blockData);
                const dataURL = stage.toDataURL({ pixelRatio: 2 });

                // Embed as image
                htmlContent += `<div class="handwriting-block"><img src="${dataURL}" alt="Handwriting" /></div>`;

                // Cleanup
                stage.destroy();
                document.body.removeChild(container);
            } else {
                // Add text content as-is
                htmlContent += element.outerHTML;
            }
        }

        htmlContent += `
</body>
</html>
`;

        // Create blob
        const blob = new Blob([htmlContent], {
            type: 'text/html',
        });

        // Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${noteTitle}.html`;
        link.click();

        // Cleanup
        URL.revokeObjectURL(link.href);

        console.log('✅ HTML exported successfully');
    } catch (error) {
        console.error('❌ Error exporting to HTML:', error);
        throw error;
    }
}
