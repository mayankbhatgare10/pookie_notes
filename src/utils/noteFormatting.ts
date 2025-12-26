/**
 * Format HTML content to readable text with proper formatting
 * Preserves checklists, bullet points, and structure
 */
export function formatContentForSharing(html: string): string {
    if (!html) return '';

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Process task lists - convert to checkbox symbols
    const taskItems = temp.querySelectorAll('li[data-type="taskItem"]');
    taskItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const isChecked = checkbox?.getAttribute('checked') !== null;
        const text = item.textContent || '';
        const prefix = isChecked ? '☑' : '☐';
        item.textContent = `${prefix} ${text}`;
    });

    // Replace common HTML elements with text equivalents
    let text = temp.innerHTML;
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<p>/gi, '');
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<li>/gi, '• ');
    text = text.replace(/<\/ul>/gi, '\n');
    text = text.replace(/<ul>/gi, '');
    text = text.replace(/<\/ol>/gi, '\n');
    text = text.replace(/<ol>/gi, '');
    text = text.replace(/<\/h[1-6]>/gi, '\n');
    text = text.replace(/<h[1-6]>/gi, '');
    text = text.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;

    // Clean up extra newlines
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    return text;
}

/**
 * Share note content using Web Share API or clipboard
 */
export async function shareNoteContent(
    title: string,
    content: string,
    onSuccess: (message: string) => void,
    onCancel?: () => void
): Promise<void> {
    const formattedContent = formatContentForSharing(content);
    const shareText = `${title}\n\n${formattedContent}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text: shareText,
            });
        } catch (error) {
            if (onCancel) {
                onCancel();
            }
        }
    } else {
        await navigator.clipboard.writeText(shareText);
        onSuccess('Note copied to clipboard! Share away! 📋');
    }
}
