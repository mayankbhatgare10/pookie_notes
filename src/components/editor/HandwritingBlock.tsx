'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import HandwritingCanvas, { HandwritingCanvasRef } from './HandwritingCanvas';
import HandwritingToolbar from './HandwritingToolbar';
import { Stroke, DrawingTool } from '@/types/handwriting';
import {
    saveHandwritingBlock,
    loadHandwritingBlock,
    deleteHandwritingBlock,
} from '@/lib/handwritingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface HandwritingBlockProps {
    node: any;
    updateAttributes: (attrs: any) => void;
    deleteNode: () => void;
    editor: any;
}

export default function HandwritingBlock({
    node,
    updateAttributes,
    deleteNode,
    editor,
}: HandwritingBlockProps) {
    const { user } = useAuth();
    const { showToast } = useToast();

    const blockId = node.attrs.blockId;
    const width = node.attrs.width || 800;
    const height = node.attrs.height || 400;

    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[][]>([]);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HandwritingCanvasRef>(null);

    // Get current note ID from editor (you may need to pass this via context or props)
    const getNoteId = useCallback(() => {
        // This is a placeholder - you'll need to implement this based on your app structure
        // Option 1: Pass noteId via editor storage
        // Option 2: Use a context
        // Option 3: Parse from URL
        return editor.storage?.noteId || 'unknown';
    }, [editor]);

    // Load handwriting block on mount
    useEffect(() => {
        const loadBlock = async () => {
            if (!user || !blockId) return;

            try {
                setIsLoading(true);
                const noteId = getNoteId();
                const blockData = await loadHandwritingBlock(user.uid, noteId, blockId);

                if (blockData) {
                    setStrokes(blockData.strokes || []);
                }
            } catch (error) {
                console.error('Failed to load handwriting block:', error);
                showToast('Failed to load handwriting. Please try again. 😢', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadBlock();
    }, [user, blockId, getNoteId, showToast]);

    // Debounced save function
    const saveBlock = useCallback(
        async (strokesToSave: Stroke[]) => {
            if (!user || !blockId) return;

            try {
                const noteId = getNoteId();
                await saveHandwritingBlock(user.uid, noteId, blockId, {
                    engine: 'konva',
                    width,
                    height,
                    strokes: strokesToSave,
                });
                console.log('✅ Handwriting block auto-saved');
            } catch (error) {
                console.error('Failed to save handwriting block:', error);
                showToast('Failed to save handwriting. Please try again. 😢', 'error');
            }
        },
        [user, blockId, width, height, getNoteId, showToast]
    );

    // Handle strokes change with debounced save
    const handleStrokesChange = useCallback(
        (newStrokes: Stroke[]) => {
            setStrokes(newStrokes);

            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Debounce save by 500ms
            saveTimeoutRef.current = setTimeout(() => {
                saveBlock(newStrokes);
            }, 500);
        },
        [saveBlock]
    );

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Toolbar handlers
    const handleUndo = useCallback(() => {
        if (canvasRef.current?.undo) {
            canvasRef.current.undo();
        }
    }, []);

    const handleRedo = useCallback(() => {
        if (canvasRef.current?.redo) {
            canvasRef.current.redo();
        }
    }, []);

    const handleClear = useCallback(() => {
        if (canvasRef.current?.clear) {
            canvasRef.current.clear();
        }
    }, []);

    const handleToolChange = useCallback((tool: DrawingTool) => {
        setCurrentTool(tool);
        if (canvasRef.current?.setTool) {
            canvasRef.current.setTool(tool);
        }
    }, []);

    const handleColorChange = useCallback((color: string) => {
        setCurrentColor(color);
        if (canvasRef.current?.setColor) {
            canvasRef.current.setColor(color);
        }
    }, []);

    const handleDeleteBlock = useCallback(async () => {
        if (!user || !blockId) return;

        const confirmed = window.confirm(
            'Are you sure you want to delete this handwriting block? This cannot be undone.'
        );

        if (!confirmed) return;

        try {
            const noteId = getNoteId();
            await deleteHandwritingBlock(user.uid, noteId, blockId);
            deleteNode();
            showToast('Handwriting block deleted! 🗑️', 'success');
        } catch (error) {
            console.error('Failed to delete handwriting block:', error);
            showToast('Failed to delete handwriting block. 😢', 'error');
        }
    }, [user, blockId, getNoteId, deleteNode, showToast]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    handleRedo();
                }
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                handleToolChange('pen');
            } else if (e.key === 'e' || e.key === 'E') {
                e.preventDefault();
                handleToolChange('eraser');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleToolChange]);

    if (isLoading) {
        return (
            <NodeViewWrapper className="handwriting-block-wrapper my-4">
                <div
                    className="flex items-center justify-center bg-white border-2 border-dashed border-black/20 rounded-xl"
                    style={{ width, height }}
                >
                    <div className="text-center">
                        <div className="text-2xl mb-2">✍️</div>
                        <div className="text-sm text-black/60 font-medium">
                            Loading handwriting...
                        </div>
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="handwriting-block-wrapper my-4">
            <div className="handwriting-block border-2 border-black/10 rounded-xl overflow-hidden bg-gradient-to-br from-[#fffef5] to-[#f5f4e8] shadow-sm">
                <HandwritingToolbar
                    currentTool={currentTool}
                    currentColor={currentColor}
                    onToolChange={handleToolChange}
                    onColorChange={handleColorChange}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClear={handleClear}
                    onDelete={handleDeleteBlock}
                    canUndo={undoStack.length > 0}
                    canRedo={redoStack.length > 0}
                    readOnly={!editor.isEditable}
                />
                <div className="p-4">
                    <HandwritingCanvas
                        ref={canvasRef}
                        blockId={blockId}
                        initialStrokes={strokes}
                        width={width}
                        height={height}
                        onStrokesChange={handleStrokesChange}
                        readOnly={!editor.isEditable}
                    />
                </div>
                <div className="px-4 py-2 bg-white/50 border-t border-black/5 text-xs text-black/50 text-center">
                    💡 Tip: Use <kbd className="px-1 py-0.5 bg-black/10 rounded">P</kbd> for pen,{' '}
                    <kbd className="px-1 py-0.5 bg-black/10 rounded">E</kbd> for eraser,{' '}
                    <kbd className="px-1 py-0.5 bg-black/10 rounded">Ctrl+Z</kbd> to undo
                </div>
            </div>
        </NodeViewWrapper>
    );
}
