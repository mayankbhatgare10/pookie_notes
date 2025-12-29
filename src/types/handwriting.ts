/**
 * Handwriting feature type definitions
 * Supports Konva.js-based live handwriting with pressure sensitivity
 */

export type DrawingTool = 'pen' | 'pencil' | 'brush' | 'highlighter' | 'eraser';

export interface Stroke {
    id: string;
    tool: DrawingTool;
    points: number[]; // Flattened array: [x1, y1, x2, y2, ...]
    color: string;
    width: number;
    tension: number; // Konva line smoothing (0-1)
    lineCap: 'round' | 'butt' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
    pressureEnabled: boolean;
    pressurePoints?: number[]; // Pressure value for each point (0-1)
    globalCompositeOperation?: string; // For eraser: 'destination-out'
}

export interface HandwritingBlockData {
    id: string;
    engine: 'konva';
    width: number;
    height: number;
    strokes: Stroke[];
    createdAt: string;
    updatedAt: string;
}

export interface HandwritingBlockAttributes {
    blockId: string;
    width: number;
    height: number;
}

export interface HandwritingCanvasProps {
    blockId: string;
    initialStrokes?: Stroke[];
    width: number;
    height: number;
    onStrokesChange: (strokes: Stroke[]) => void;
    readOnly?: boolean;
}

export interface HandwritingToolbarProps {
    currentTool: DrawingTool;
    currentColor: string;
    onToolChange: (tool: DrawingTool) => void;
    onColorChange: (color: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onDelete: () => void;
    canUndo: boolean;
    canRedo: boolean;
    readOnly?: boolean;
}

export interface KonvaStageConfig {
    width: number;
    height: number;
    container: string | HTMLDivElement;
}

export interface DrawingState {
    isDrawing: boolean;
    currentStroke: Stroke | null;
    strokes: Stroke[];
    undoStack: Stroke[][];
    redoStack: Stroke[][];
}
