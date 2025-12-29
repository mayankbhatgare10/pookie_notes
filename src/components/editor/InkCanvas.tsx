'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { loadKonvaModules } from '@/utils/lazyLoadKonva';

export interface Stroke {
    id: string;
    tool: 'pen' | 'eraser';
    points: number[];
    color: string;
    width: number;
    tension: number;
    lineCap: 'round' | 'butt' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
    pressureEnabled: boolean;
    pressurePoints?: number[];
}

export interface InkCanvasRef {
    clear: () => void;
    undo: () => void;
    redo: () => void;
    getStrokes: () => Stroke[];
    setStrokes: (strokes: Stroke[]) => void;
    exportToPNG: () => string;
}

interface InkCanvasProps {
    isActive: boolean;
    currentTool: 'pen' | 'pencil' | 'brush' | 'highlighter' | 'eraser';
    currentColor: string;
    currentStrokeSize?: number;
    onStrokesChange?: (strokes: Stroke[]) => void;
    onRedoStackChange?: (canRedo: boolean) => void;
    initialStrokes?: Stroke[];
}

const InkCanvas = forwardRef<InkCanvasRef, InkCanvasProps>(({
    isActive,
    currentTool,
    currentColor,
    currentStrokeSize = 2,
    onStrokesChange,
    onRedoStackChange,
    initialStrokes = [],
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);
    const [isKonvaLoaded, setIsKonvaLoaded] = useState(false);
    const [konvaModules, setKonvaModules] = useState<any>(null);

    const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
    const [redoStack, setRedoStack] = useState<Stroke[][]>([]);

    const isPenActiveRef = useRef(false);

    // Lazy-load Konva on mount (always load, not just when active)
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
    }, []); // Load on mount, not dependent on isActive

    // Initialize Konva stage (always initialize, not just when active)
    useEffect(() => {
        if (!isKonvaLoaded || !konvaModules || !containerRef.current) return;

        const { konva } = konvaModules;
        const container = containerRef.current;

        // Create stage that fills the container
        const stage = new konva.Stage({
            container: container,
            width: container.offsetWidth,
            height: container.offsetHeight,
        });

        const layer = new konva.Layer();
        stage.add(layer);

        stageRef.current = stage;
        layerRef.current = layer;

        // Render initial strokes
        renderStrokes(initialStrokes, layer, konva);

        // Handle window resize
        const handleResize = () => {
            if (containerRef.current) {
                stage.width(containerRef.current.offsetWidth);
                stage.height(containerRef.current.offsetHeight);
                stage.batchDraw();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            stage.destroy();
        };
    }, [isKonvaLoaded, konvaModules]); // Removed isActive dependency

    // Render strokes
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
            if (!isActive || !stageRef.current) return;

            // Palm rejection
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

            // DISTINCT CHARACTERISTICS FOR EACH TOOL
            let baseWidth = currentStrokeSize;
            let tension = 0.5;
            let lineCap: 'round' | 'butt' | 'square' = 'round';
            let opacity = 1;
            let pressureSensitivity = 1;

            switch (currentTool) {
                case 'pen':
                    // Pen: Smooth, consistent, medium pressure sensitivity
                    baseWidth = currentStrokeSize;
                    tension = 0.8; // Very smooth
                    lineCap = 'round';
                    pressureSensitivity = 0.5; // Medium pressure variation
                    break;

                case 'pencil':
                    // Pencil: Rough, sketchy, high pressure sensitivity, slightly transparent
                    baseWidth = currentStrokeSize * 0.7;
                    tension = 0.1; // Very rough, jagged lines
                    lineCap = 'round';
                    opacity = 0.7; // Slightly transparent like graphite
                    pressureSensitivity = 1.5; // High pressure variation
                    break;

                case 'brush':
                    // Brush: Thick, very pressure sensitive, smooth
                    baseWidth = currentStrokeSize * 2;
                    tension = 0.6; // Smooth but not too much
                    lineCap = 'round';
                    pressureSensitivity = 2; // Very high pressure variation
                    break;

                case 'highlighter':
                    // Highlighter: Wide, flat, semi-transparent, no pressure
                    baseWidth = currentStrokeSize * 4;
                    tension = 0.9; // Very smooth
                    lineCap = 'butt'; // Flat ends like real highlighter
                    opacity = 0.3; // Very transparent
                    pressureSensitivity = 0; // No pressure variation
                    break;

                case 'eraser':
                    // Eraser: Fixed size, no pressure
                    baseWidth = 20;
                    tension = 0.5;
                    lineCap = 'round';
                    pressureSensitivity = 0;
                    break;
            }

            // Calculate stroke width with pressure
            const strokeWidth = currentTool === 'eraser' || currentTool === 'highlighter'
                ? baseWidth
                : baseWidth * (1 - pressureSensitivity * 0.3 + pressure * pressureSensitivity * 0.6);

            // Apply opacity to color
            const finalColor = currentTool === 'eraser'
                ? currentColor
                : currentColor + Math.round(opacity * 255).toString(16).padStart(2, '0');

            const newStroke: Stroke = {
                id: `stroke_${Date.now()}_${Math.random()}`,
                tool: currentTool as any,
                points: [pos.x, pos.y],
                color: finalColor,
                width: strokeWidth,
                tension: tension,
                lineCap: lineCap,
                lineJoin: 'round',
                pressureEnabled: currentTool !== 'eraser' && currentTool !== 'highlighter',
                pressurePoints: [pressure],
            };

            setCurrentStroke(newStroke);
            setIsDrawing(true);
        },
        [isActive, currentTool, currentColor, currentStrokeSize]
    );

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!isDrawing || !currentStroke || !stageRef.current) return;

            const stage = stageRef.current;
            const pos = stage.getPointerPosition();
            if (!pos) return;

            const pressure = e.pressure || 0.5;

            const updatedStroke = {
                ...currentStroke,
                points: [...currentStroke.points, pos.x, pos.y],
                pressurePoints: [...(currentStroke.pressurePoints || []), pressure],
            };

            setCurrentStroke(updatedStroke);

            if (layerRef.current && konvaModules) {
                const { konva } = konvaModules;
                const layer = layerRef.current;
                renderStrokes([...strokes, updatedStroke], layer, konva);
            }
        },
        [isDrawing, currentStroke, strokes, konvaModules, renderStrokes]
    );

    const handlePointerUp = useCallback(() => {
        if (!isDrawing || !currentStroke) return;

        const newStrokes = [...strokes, currentStroke];
        setStrokes(newStrokes);
        setUndoStack([...undoStack, strokes]);
        setRedoStack([]);

        if (onStrokesChange) {
            onStrokesChange(newStrokes);
        }

        setIsDrawing(false);
        setCurrentStroke(null);
        isPenActiveRef.current = false;
    }, [isDrawing, currentStroke, strokes, undoStack, onStrokesChange]);

    // Attach pointer events
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isActive) return;

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
    }, [handlePointerDown, handlePointerMove, handlePointerUp, isActive]);

    // Undo
    const handleUndo = useCallback(() => {
        if (undoStack.length === 0) return;

        const previousStrokes = undoStack[undoStack.length - 1];
        const newRedoStack = [...redoStack, strokes];
        setRedoStack(newRedoStack);
        setUndoStack(undoStack.slice(0, -1));
        setStrokes(previousStrokes);

        if (onStrokesChange) {
            onStrokesChange(previousStrokes);
        }
        if (onRedoStackChange) {
            onRedoStackChange(newRedoStack.length > 0);
        }
    }, [undoStack, redoStack, strokes, onStrokesChange, onRedoStackChange]);

    // Redo
    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return;

        const nextStrokes = redoStack[redoStack.length - 1];
        setUndoStack([...undoStack, strokes]);
        const newRedoStack = redoStack.slice(0, -1);
        setRedoStack(newRedoStack);
        setStrokes(nextStrokes);

        if (onStrokesChange) {
            onStrokesChange(nextStrokes);
        }
        if (onRedoStackChange) {
            onRedoStackChange(newRedoStack.length > 0);
        }
    }, [redoStack, undoStack, strokes, onStrokesChange, onRedoStackChange]);

    // Clear
    const handleClear = useCallback(() => {
        setUndoStack([...undoStack, strokes]);
        setRedoStack([]);
        setStrokes([]);

        if (onStrokesChange) {
            onStrokesChange([]);
        }
    }, [undoStack, strokes, onStrokesChange]);

    // Export to PNG
    const exportToPNG = useCallback(() => {
        if (!stageRef.current) return '';
        return stageRef.current.toDataURL({ pixelRatio: 2 });
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        clear: handleClear,
        undo: handleUndo,
        redo: handleRedo,
        getStrokes: () => strokes,
        setStrokes: (newStrokes: Stroke[]) => setStrokes(newStrokes),
        exportToPNG,
    }), [handleClear, handleUndo, handleRedo, strokes, exportToPNG]);

    // Always render the canvas, just control pointer events
    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-10 ink-canvas"
            style={{
                pointerEvents: isActive ? 'auto' : 'none',
                cursor: isActive ? (currentTool === 'eraser' ? 'pointer' : 'crosshair') : 'default',
            }}
        />
    );
});

InkCanvas.displayName = 'InkCanvas';

export default InkCanvas;
