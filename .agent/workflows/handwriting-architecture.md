---
description: Live Handwriting Feature Architecture
---

# Pookie-Notes Live Handwriting Architecture

## 1. System Architecture Overview

### Component Hierarchy
```
NoteEditor (TipTap)
├── EditorContent (TipTap text blocks)
└── HandwritingBlock (Custom TipTap Node Extension)
    ├── HandwritingCanvas (Konva.js wrapper)
    │   ├── Konva Stage
    │   └── Konva Layer (strokes)
    └── HandwritingToolbar (minimal controls)
```

### Technology Stack
- **Drawing Engine**: Konva.js (lazy-loaded)
- **Event System**: Pointer Events API (pressure-sensitive)
- **Storage**: Firestore (vector/path JSON data)
- **Export**: jsPDF (PDF) + custom Word export

---

## 2. Data Model

### Firestore Schema Extension
```typescript
interface Note {
  // ... existing fields
  content: string; // TipTap HTML with handwriting block markers
  handwritingBlocks?: {
    [blockId: string]: HandwritingBlockData;
  };
}

interface HandwritingBlockData {
  id: string;
  engine: 'konva';
  width: number;
  height: number;
  strokes: Stroke[];
  createdAt: string;
  updatedAt: string;
}

interface Stroke {
  id: string;
  tool: 'pen' | 'eraser';
  points: number[]; // Flattened [x1, y1, x2, y2, ...]
  color: string;
  width: number;
  tension: number; // Konva line smoothing
  lineCap: 'round' | 'butt' | 'square';
  lineJoin: 'round' | 'bevel' | 'miter';
  pressureEnabled: boolean;
  pressurePoints?: number[]; // Pressure values for each point
}
```

### TipTap Content Structure
```html
<!-- TipTap HTML output -->
<p>Regular text content</p>
<div class="handwriting-block" data-block-id="hw_abc123">
  <!-- Placeholder for rendering -->
</div>
<p>More text content</p>
```

---

## 3. Component Architecture

### 3.1 TipTap Extension: HandwritingNode

**Purpose**: Custom TipTap node that renders handwriting blocks inline.

**Key Features**:
- Node view renders React component
- Stores block ID reference
- Non-editable in text mode
- Maintains position in document flow

```typescript
// src/components/editor/extensions/HandwritingNode.ts
const HandwritingNode = Node.create({
  name: 'handwritingBlock',
  group: 'block',
  atom: true, // Cannot be edited as text
  
  addAttributes() {
    return {
      blockId: { default: null },
      width: { default: 800 },
      height: { default: 400 },
    };
  },
  
  parseHTML() {
    return [{ tag: 'div.handwriting-block' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'handwriting-block', ...HTMLAttributes }];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(HandwritingBlockComponent);
  },
});
```

### 3.2 HandwritingBlockComponent

**Purpose**: React wrapper that lazy-loads Konva and manages canvas lifecycle.

**Responsibilities**:
- Lazy-load Konva.js on mount
- Initialize Konva Stage/Layer
- Handle pointer events
- Sync strokes to parent editor
- Provide minimal toolbar

```typescript
// src/components/editor/HandwritingBlock.tsx
interface HandwritingBlockProps {
  node: Node;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  editor: Editor;
}
```

### 3.3 HandwritingCanvas

**Purpose**: Core Konva.js drawing logic with pressure sensitivity.

**Key Features**:
- Pointer event handling (touch, pen, mouse)
- Pressure-sensitive stroke width
- Real-time stroke rendering
- Undo/redo stack
- Export to SVG/PNG

```typescript
// src/components/editor/HandwritingCanvas.tsx
interface HandwritingCanvasProps {
  blockId: string;
  initialStrokes: Stroke[];
  width: number;
  height: number;
  onStrokesChange: (strokes: Stroke[]) => void;
  readOnly?: boolean;
}
```

---

## 4. Event Handling Strategy

### Pointer Events Flow
```
User touches canvas with Apple Pencil
  ↓
onPointerDown → Start new stroke
  ↓
onPointerMove → Add points with pressure
  ↓
onPointerUp → Finalize stroke, save to state
  ↓
Debounced save to Firestore
```

### Pressure Sensitivity Implementation
```typescript
const handlePointerMove = (e: PointerEvent) => {
  const pressure = e.pressure || 0.5;
  const baseWidth = currentTool === 'pen' ? 2 : 10;
  const dynamicWidth = baseWidth * (0.5 + pressure);
  
  // Add point to current stroke
  currentStroke.points.push(e.offsetX, e.offsetY);
  currentStroke.pressurePoints.push(pressure);
  
  // Update Konva line with variable width
  updateKonvaLine(currentStroke, dynamicWidth);
};
```

### Palm Rejection Strategy
```typescript
// Ignore touch events when pen is active
let isPenActive = false;

const handlePointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'pen') {
    isPenActive = true;
  } else if (e.pointerType === 'touch' && isPenActive) {
    e.preventDefault(); // Reject palm
    return;
  }
  // ... drawing logic
};
```

---

## 5. Persistence Strategy

### Save Flow
```
User draws stroke
  ↓
Stroke added to local state
  ↓
Debounced (500ms) save trigger
  ↓
Serialize strokes to JSON
  ↓
Update Firestore: notes/{noteId}/handwritingBlocks/{blockId}
  ↓
Update TipTap content HTML (block marker)
```

### Load/Rehydration Flow
```
Note opened
  ↓
TipTap parses HTML, finds handwriting blocks
  ↓
HandwritingBlock component mounts
  ↓
Fetch strokes from Firestore by blockId
  ↓
Lazy-load Konva.js
  ↓
Render strokes on canvas
  ↓
Ready for editing
```

### Database Operations
```typescript
// Save handwriting block
async function saveHandwritingBlock(
  userId: string,
  noteId: string,
  blockId: string,
  data: HandwritingBlockData
) {
  const blockRef = doc(
    db,
    'users',
    userId,
    'notes',
    noteId,
    'handwritingBlocks',
    blockId
  );
  await setDoc(blockRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Load handwriting block
async function loadHandwritingBlock(
  userId: string,
  noteId: string,
  blockId: string
): Promise<HandwritingBlockData | null> {
  const blockRef = doc(
    db,
    'users',
    userId,
    'notes',
    noteId,
    'handwritingBlocks',
    blockId
  );
  const snapshot = await getDoc(blockRef);
  return snapshot.exists() ? snapshot.data() as HandwritingBlockData : null;
}
```

---

## 6. Export Pipeline

### PDF Export Strategy

**Approach**: Render Konva canvas to PNG, insert into jsPDF.

```typescript
// src/utils/exportToPDF.ts
async function exportNoteToPDF(note: Note, editor: Editor) {
  const pdf = new jsPDF();
  let yOffset = 20;
  
  // Parse TipTap content
  const content = editor.getHTML();
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // Process each block
  for (const element of doc.body.children) {
    if (element.classList.contains('handwriting-block')) {
      const blockId = element.getAttribute('data-block-id');
      const blockData = await loadHandwritingBlock(userId, noteId, blockId);
      
      // Render Konva to PNG
      const stage = recreateKonvaStage(blockData);
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      
      // Add to PDF
      pdf.addImage(dataURL, 'PNG', 10, yOffset, 190, 100);
      yOffset += 110;
    } else {
      // Add text content
      const text = element.textContent || '';
      pdf.text(text, 10, yOffset);
      yOffset += 10;
    }
  }
  
  pdf.save(`${note.title}.pdf`);
}
```

### Word Export Strategy

**Approach**: Convert to HTML with embedded base64 images.

```typescript
// src/utils/exportToWord.ts
async function exportNoteToWord(note: Note, editor: Editor) {
  let htmlContent = '<html><body>';
  
  const content = editor.getHTML();
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  for (const element of doc.body.children) {
    if (element.classList.contains('handwriting-block')) {
      const blockId = element.getAttribute('data-block-id');
      const blockData = await loadHandwritingBlock(userId, noteId, blockId);
      
      // Render to PNG
      const stage = recreateKonvaStage(blockData);
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      
      // Embed as image
      htmlContent += `<img src="${dataURL}" style="max-width: 100%;" />`;
    } else {
      htmlContent += element.outerHTML;
    }
  }
  
  htmlContent += '</body></html>';
  
  // Convert to .docx using blob
  const blob = new Blob([htmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  
  downloadBlob(blob, `${note.title}.docx`);
}
```

### SVG Export (Alternative)

**Advantage**: Vector format, smaller file size, scalable.

```typescript
// Konva supports SVG export via plugin
import { Stage } from 'konva';

const svgString = stage.toDataURL({ mimeType: 'image/svg+xml' });
```

---

## 7. Performance Considerations

### Lazy Loading Strategy
```typescript
// src/utils/lazyLoadKonva.ts
let konvaModule: any = null;

export async function loadKonva() {
  if (!konvaModule) {
    konvaModule = await import('konva');
  }
  return konvaModule;
}
```

### Optimization Techniques
1. **Debounced Saves**: Save to Firestore max once per 500ms
2. **Stroke Simplification**: Reduce point density for long strokes
3. **Canvas Pooling**: Reuse Konva stages when possible
4. **Lazy Rendering**: Only render visible handwriting blocks (viewport)
5. **Incremental Saves**: Save only changed strokes, not entire block

### Memory Management
```typescript
// Cleanup on unmount
useEffect(() => {
  return () => {
    stage?.destroy();
    layer?.destroy();
  };
}, []);
```

---

## 8. UX Integration

### Slash Command
```typescript
// Add to CommandMenu.tsx
{
  title: 'Handwriting Block',
  command: '/handwrite',
  icon: '✍️',
  action: () => {
    const blockId = `hw_${Date.now()}`;
    editor.chain().focus().insertContent({
      type: 'handwritingBlock',
      attrs: { blockId, width: 800, height: 400 },
    }).run();
  },
}
```

### Toolbar Button
```typescript
// Add to EditorToolbar.tsx
<button
  onClick={insertHandwritingBlock}
  className="toolbar-button"
  title="Add Handwriting Block"
>
  ✍️
</button>
```

### Minimal Handwriting Toolbar
```
[Pen] [Eraser] [Color: ⚫] [Undo] [Redo] [Delete Block]
```

---

## 9. Implementation Phases

### Phase 1: Core Infrastructure (Day 1-2)
- [ ] Create TipTap HandwritingNode extension
- [ ] Build HandwritingBlock React component
- [ ] Implement lazy Konva loading
- [ ] Basic stroke drawing (no pressure)

### Phase 2: Drawing Features (Day 3-4)
- [ ] Pointer event handling
- [ ] Pressure sensitivity
- [ ] Eraser tool
- [ ] Undo/redo
- [ ] Color picker

### Phase 3: Persistence (Day 5-6)
- [ ] Firestore schema setup
- [ ] Save/load handwriting blocks
- [ ] Rehydration on note open
- [ ] Debounced auto-save

### Phase 4: Export (Day 7-8)
- [ ] PDF export with handwriting
- [ ] Word export with handwriting
- [ ] SVG rendering option
- [ ] Export testing

### Phase 5: Polish (Day 9-10)
- [ ] Palm rejection
- [ ] Performance optimization
- [ ] iPad/Apple Pencil testing
- [ ] UI/UX refinements

---

## 10. Testing Checklist

### Functional Tests
- [ ] Create handwriting block via slash command
- [ ] Draw smooth strokes with pen
- [ ] Erase strokes
- [ ] Undo/redo works correctly
- [ ] Save and reload note preserves handwriting
- [ ] Export to PDF includes handwriting
- [ ] Export to Word includes handwriting

### Device Tests
- [ ] Desktop (mouse)
- [ ] iPad + Apple Pencil
- [ ] Android tablet + stylus
- [ ] Touch-only devices

### Performance Tests
- [ ] Note with 10+ handwriting blocks loads quickly
- [ ] Drawing feels responsive (< 16ms latency)
- [ ] Export completes in < 5 seconds
- [ ] No memory leaks after 30min session

---

## 11. Success Metrics

✅ **Handwriting is never lost**: All strokes persist to Firestore
✅ **Handwriting always exports**: PDF/Word include all blocks
✅ **App remains lightweight**: Konva lazy-loaded, < 100KB bundle increase
✅ **Smooth drawing**: Pressure-sensitive, < 16ms input latency
✅ **iPad-friendly**: Apple Pencil works perfectly, palm rejection active

---

## 12. File Structure

```
src/
├── components/
│   └── editor/
│       ├── extensions/
│       │   └── HandwritingNode.ts          # TipTap extension
│       ├── HandwritingBlock.tsx            # Main component
│       ├── HandwritingCanvas.tsx           # Konva wrapper
│       └── HandwritingToolbar.tsx          # Minimal controls
├── lib/
│   └── handwritingService.ts               # Firestore operations
├── utils/
│   ├── lazyLoadKonva.ts                    # Dynamic import
│   ├── exportHandwritingToPDF.ts           # PDF export
│   └── exportHandwritingToWord.ts          # Word export
└── types/
    └── handwriting.ts                      # TypeScript interfaces
```

---

## Next Steps

1. Install Konva.js: `npm install konva react-konva`
2. Create TypeScript interfaces
3. Build TipTap extension
4. Implement HandwritingCanvas component
5. Test on iPad with Apple Pencil
