'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Stroke, DrawingTool, HandwritingCanvasProps } from '@/types/handwriting';
import { loadKonvaModules } from '@/utils/lazyLoadKonva';

export interface HandwritingCanvasRef {
    undo: () => void;
    redo: () => void;
    clear: () => void;
    setTool: (tool: DrawingTool) => void;
    setColor: (color: string) => void;
}

const HandwritingCanvas = forwardRef<HandwritingCanvasRef, HandwritingCanvasProps>(({
    blockId,
    initialStrokes = [],
    width,
    height,
    onStrokesChange,
    readOnly = false,
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);
    const [isKonvaLoaded, setIsKonvaLoaded] = useState(false);
    const [konvaModules, setKonvaModules] = useState<any>(null);

    // Drawing state
    const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
    const [currentColor, setCurrentColor] = useState('#000000');
    const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[][]>([]);

    // Track if pen is active for palm rejection
    const isPenActiveRef = useRef(false);

    // Lazy-load Konva on mount
    useEffect(() => {
        let mounted = true;

        const loadKonva = async () => {
            try {
                const modules = await loadKonvaModules();
                if (mounted) {
                    setKonvaModules(modules);
                    setIsKonvaLoaded(true);
                }
            } catch (error) {
                console.error('Failed to load Konva:', error);
            }
        };

        loadKonva();

        return () => {
            mounted = false;
        };
    }, []);

    // Initialize Konva stage and layer
    useEffect(() => {
        if (!isKonvaLoaded || !konvaModules || !containerRef.current) return;

        const { konva } = konvaModules;

        // Create stage
        const stage = new konva.Stage({
            container: containerRef.current,
            width,
            height,
        });

        // Create layer
        const layer = new konva.Layer();
        stage.add(layer);

        stageRef.current = stage;
        layerRef.current = layer;

        // Render initial strokes
        renderStrokes(initialStrokes, layer, konva);

        return () => {
            stage.destroy();
        };
    }, [isKonvaLoaded, konvaModules, width, height]);

    // Render strokes to Konva layer
    const renderStrokes = useCallback(
        (strokesToRender: Stroke[], layer: any, konva: any) => {
            if (!layer || !konva) return;

            layer.destroyChildren();

            strokesToRender.forEach((stroke) => {
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
        },
        []
    );

    // Re-render when strokes change
    useEffect(() => {
        if (layerRef.current && konvaModules) {
            renderStrokes(strokes, layerRef.current, konvaModules.konva);
        }
    }, [strokes, konvaModules, renderStrokes]);

    // Pointer event handlers
    const handlePointerDown = useCallback(
        (e: PointerEvent) => {
            if (readOnly || !stageRef.current) return;

            // Palm rejection: ignore touch if pen is active
            if (e.pointerType === 'pen') {
                isPenActiveRef.current = true;
            } else if (e.pointerType === 'touch' && isPenActiveRef.current) {
                e.preventDefault();
                return;
            }

            const stage = stageRef.current;
            const pos = stage.getPointerPosition();
            if (!pos) return;

            const pressure = e.pressure || 0.5;
            const baseWidth = currentTool === 'pen' ? 2 : 20;
            const strokeWidth = baseWidth * (0.5 + pressure);

            const newStroke: Stroke = {
                id: `stroke_${Date.now()}_${Math.random()}`,
                tool: currentTool,
                points: [pos.x, pos.y],
                color: currentColor,
                width: strokeWidth,
                tension: 0.5,
                lineCap: 'round',
                lineJoin: 'round',
                pressureEnabled: true,
                pressurePoints: [pressure],
                globalCompositeOperation:
                    currentTool === 'eraser' ? 'destination-out' : undefined,
            };

            setCurrentStroke(newStroke);
            setIsDrawing(true);
        },
        [readOnly, currentTool, currentColor]
    );

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!isDrawing || !currentStroke || !stageRef.current) return;

            const stage = stageRef.current;
            const pos = stage.getPointerPosition();
            if (!pos) return;

            const pressure = e.pressure || 0.5;

            // Update current stroke
            const updatedStroke = {
                ...currentStroke,
                points: [...currentStroke.points, pos.x, pos.y],
                pressurePoints: [...(currentStroke.pressurePoints || []), pressure],
            };

            setCurrentStroke(updatedStroke);

            // Render current stroke in real-time
            if (layerRef.current && konvaModules) {
                const { konva } = konvaModules;
                const layer = layerRef.current;

                // Clear and re-render all strokes plus current
                renderStrokes([...strokes, updatedStroke], layer, konva);
            }
        },
        [isDrawing, currentStroke, strokes, konvaModules, renderStrokes]
    );

    const handlePointerUp = useCallback(() => {
        if (!isDrawing || !currentStroke) return;

        // Finalize stroke
        const newStrokes = [...strokes, currentStroke];
        setStrokes(newStrokes);
        setUndoStack([...undoStack, strokes]);
        setRedoStack([]); // Clear redo stack on new action

        // Notify parent
        onStrokesChange(newStrokes);

        setIsDrawing(false);
        setCurrentStroke(null);
        isPenActiveRef.current = false;
    }, [isDrawing, currentStroke, strokes, undoStack, onStrokesChange]);

    // Attach pointer events to container
    useEffect(() => {
        const container = containerRef.current;
        if (!container || readOnly) return;

        container.addEventListener('pointerdown', handlePointerDown as any);
        container.addEventListener('pointermove', handlePointerMove as any);
        container.addEventListener('pointerup', handlePointerUp);
        container.addEventListener('pointerleave', handlePointerUp);

        return () => {
            container.removeEventListener('pointerdown', handlePointerDown as any);
            container.removeEventListener('pointermove', handlePointerMove as any);
            container.removeEventListener('pointerup', handlePointerUp);
            container.removeEventListener('pointerleave', handlePointerUp);
        };
    }, [handlePointerDown, handlePointerMove, handlePointerUp, readOnly]);

    // Undo function
    const handleUndo = useCallback(() => {
        if (undoStack.length === 0) return;

        const previousStrokes = undoStack[undoStack.length - 1];
        setRedoStack([...redoStack, strokes]);
        setUndoStack(undoStack.slice(0, -1));
        setStrokes(previousStrokes);
        onStrokesChange(previousStrokes);
    }, [undoStack, redoStack, strokes, onStrokesChange]);

    // Redo function
    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return;

        const nextStrokes = redoStack[redoStack.length - 1];
        setUndoStack([...undoStack, strokes]);
        setRedoStack(redoStack.slice(0, -1));
        setStrokes(nextStrokes);
        onStrokesChange(nextStrokes);
    }, [redoStack, undoStack, strokes, onStrokesChange]);

    // Clear canvas
    const handleClear = useCallback(() => {
        setUndoStack([...undoStack, strokes]);
        setRedoStack([]);
        setStrokes([]);
        onStrokesChange([]);
    }, [undoStack, strokes, onStrokesChange]);

    // Expose functions to parent via ref using useImperativeHandle
    useImperativeHandle(ref, () => ({
        undo: handleUndo,
        redo: handleRedo,
        clear: handleClear,
        setTool: setCurrentTool,
        setColor: setCurrentColor,
    }), [handleUndo, handleRedo, handleClear]);

    if (!isKonvaLoaded) {
        return (
            <div
                className="flex items-center justify-center bg-white border-2 border-dashed border-black/20 rounded-xl"
                style={{ width, height }}
            >
                <div className="text-center">
                    <div className="text-2xl mb-2">✍️</div>
                    <div className="text-sm text-black/60 font-medium">
                        Loading handwriting canvas...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="handwriting-canvas-wrapper">
            <div
                ref={containerRef}
                className="handwriting-canvas border-2 border-black/10 rounded-xl bg-white"
                style={{
                    width,
                    height,
                    touchAction: 'none', // Prevent default touch behaviors
                    cursor: readOnly ? 'default' : currentTool === 'pen' ? 'crosshair' : 'pointer',
                }}
            />
        </div>
    );
});

HandwritingCanvas.displayName = 'HandwritingCanvas';

export default HandwritingCanvas;
