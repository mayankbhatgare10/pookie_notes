# Ink Overlay Mode - Integration Guide

## 🎨 What This Is

A **full-canvas ink overlay** that lets you draw freely over your entire note (like Excalidraw) without interfering with text editing or checkboxes.

### Key Features:
- ✍️ **Toggle ink mode** - Press `I` or click button to enter/exit drawing mode
- 🖊️ **Draw anywhere** - Full canvas overlay, draw over text
- ✅ **Doesn't interfere** - Checkboxes and text editing work normally when ink mode is OFF
- 💾 **Persistent** - Ink strokes saved to Firestore with the note
- 📤 **Exports** - Ink layer exported with PDF/Word

---

## 🚀 Integration Steps

### Step 1: Add Ink State to NoteEditor.tsx

Add these state variables after your existing state (around line 55):

```typescript
// Ink overlay state
const [isInkMode, setIsInkMode] = useState(false);
const [inkTool, setInkTool] = useState<'pen' | 'eraser'>('pen');
const [inkColor, setInkColor] = useState('#000000');
const [inkStrokes, setInkStrokes] = useState<any[]>([]);
const inkCanvasRef = useRef<any>(null);
```

### Step 2: Load Ink Strokes on Note Open

Add this effect after your existing note loading logic (around line 200):

```typescript
// Load ink strokes when note opens
useEffect(() => {
  const loadInk = async () => {
    if (!note?.id || !user) return;
    
    try {
      const { loadInkStrokes } = await import('@/lib/handwritingService');
      const strokes = await loadInkStrokes(user.uid, note.id);
      setInkStrokes(strokes);
    } catch (error) {
      console.error('Failed to load ink strokes:', error);
    }
  };

  if (isOpen && note) {
    loadInk();
  }
}, [isOpen, note?.id, user]);
```

### Step 3: Save Ink Strokes (Debounced)

Add this save handler:

```typescript
// Debounced save for ink strokes
const saveInkStrokesDebounced = useCallback(
  debounce(async (strokes: any[]) => {
    if (!note?.id || !user) return;
    
    try {
      const { saveInkStrokes } = await import('@/lib/handwritingService');
      await saveInkStrokes(user.uid, note.id, strokes);
      console.log('✅ Ink strokes auto-saved');
    } catch (error) {
      console.error('Failed to save ink strokes:', error);
    }
  }, 500),
  [note?.id, user]
);

const handleInkStrokesChange = useCallback((strokes: any[]) => {
  setInkStrokes(strokes);
  saveInkStrokesDebounced(strokes);
}, [saveInkStrokesDebounced]);
```

### Step 4: Keyboard Shortcuts

Add ink mode keyboard shortcuts to your existing keyboard handler:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Toggle ink mode with 'I' key
    if (e.key === 'i' || e.key === 'I') {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsInkMode(prev => !prev);
        return;
      }
    }

    // Only handle these shortcuts when in ink mode
    if (isInkMode) {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setInkTool('pen');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setInkTool('eraser');
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          inkCanvasRef.current?.undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          inkCanvasRef.current?.redo();
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isInkMode]);
```

### Step 5: Add Imports

Add these imports at the top of NoteEditor.tsx:

```typescript
import InkCanvas from './editor/InkCanvas';
import InkToolbar from './editor/InkToolbar';
```

### Step 6: Add InkToolbar to Render

Replace your existing EditorToolbar section with this (around line 470):

```typescript
{/* Ink Toolbar */}
<InkToolbar
  isInkMode={isInkMode}
  currentTool={inkTool}
  currentColor={inkColor}
  onToggleInkMode={() => setIsInkMode(!isInkMode)}
  onToolChange={setInkTool}
  onColorChange={setInkColor}
  onUndo={() => inkCanvasRef.current?.undo()}
  onRedo={() => inkCanvasRef.current?.redo()}
  onClear={() => inkCanvasRef.current?.clear()}
  canUndo={inkStrokes.length > 0}
  canRedo={false}
/>

{/* Regular Toolbar (only show when NOT in ink mode) */}
{isEditing && !isInkMode && (
  <EditorToolbar
    editor={editor}
    fontFamily={fontFamily}
    setFontFamily={setFontFamily}
    fontSize={fontSize}
    setFontSize={setFontSize}
  />
)}
```

### Step 7: Add InkCanvas Overlay

Add the ink canvas overlay inside the editor container (around line 502):

```typescript
{/* Editor Area */}
<div className="flex-1 overflow-y-auto px-4 md:px-10 py-4 md:py-8 bg-white relative">
  {/* Ink Canvas Overlay */}
  <InkCanvas
    ref={inkCanvasRef}
    isActive={isInkMode}
    currentTool={inkTool}
    currentColor={inkColor}
    onStrokesChange={handleInkStrokesChange}
    initialStrokes={inkStrokes}
  />

  {/* Editor Content */}
  <div className="max-w-4xl mx-auto" style={{ pointerEvents: isInkMode ? 'none' : 'auto' }}>
    <EditorContent editor={editor} style={{ fontSize: `${fontSize}px`, fontFamily }} />

    {/* Command Menu */}
    <CommandMenu
      isOpen={showCommandMenu}
      position={menuPosition}
      search={commandSearch}
      editor={editor}
      onClose={() => setShowCommandMenu(false)}
    />
  </div>
</div>
```

### Step 8: Update Editor Editability

Make sure the editor is not editable when in ink mode. Update your editor editable logic:

```typescript
useEffect(() => {
  editor?.setEditable(isEditing && !isInkMode);
}, [isEditing, isInkMode, editor]);
```

---

## 🎯 How It Works

### User Flow:

1. **Open a note** → Ink strokes load from Firestore
2. **Press `I` or click "Ink Mode"** → Canvas overlay appears
3. **Draw freely** → Strokes appear in real-time
4. **Press `I` again** → Exit ink mode, back to text editing
5. **Checkboxes still work** → Click through the ink layer when not in ink mode
6. **Auto-saves** → Ink strokes save every 500ms

### Keyboard Shortcuts:

| Key | Action |
|-----|--------|
| `I` | Toggle ink mode ON/OFF |
| `P` | Switch to pen tool (when in ink mode) |
| `E` | Switch to eraser tool (when in ink mode) |
| `Ctrl+Z` | Undo stroke (when in ink mode) |
| `Ctrl+Y` | Redo stroke (when in ink mode) |

---

## 📊 Data Structure

Ink strokes are saved directly on the note document:

```typescript
{
  id: "note_123",
  title: "My Note",
  content: "<p>Regular text content...</p>",
  inkStrokes: [
    {
      id: "stroke_1",
      tool: "pen",
      points: [10, 20, 15, 25, 20, 30, ...],
      color: "#000000",
      width: 2,
      tension: 0.5,
      lineCap: "round",
      lineJoin: "round",
      pressureEnabled: true,
      pressurePoints: [0.5, 0.6, 0.7, ...]
    },
    // ... more strokes
  ],
  inkUpdatedAt: "2025-12-29T22:42:00Z"
}
```

---

## 📤 Export with Ink

Update your export functions to include the ink layer:

```typescript
const handleExportPDF = async () => {
  if (!note || !user) return;

  try {
    // Get ink layer as PNG
    const inkPNG = inkCanvasRef.current?.exportToPNG();

    // Export with ink overlay
    await exportNoteToPDFWithInk(
      user.uid,
      note.id,
      note.title,
      editor.getHTML(),
      inkPNG
    );

    showToast('PDF exported with ink! 📄', 'success');
  } catch (error) {
    showToast('Failed to export PDF. 😢', 'error');
  }
};
```

---

## ✅ Testing Checklist

- [ ] Press `I` → Ink mode activates
- [ ] Draw with mouse → Smooth strokes appear
- [ ] Press `I` again → Ink mode deactivates, strokes remain visible
- [ ] Click checkboxes → They work even with ink overlay
- [ ] Edit text → Works normally when ink mode is OFF
- [ ] Save and reload → Ink strokes persist
- [ ] Press `P` in ink mode → Pen tool selected
- [ ] Press `E` in ink mode → Eraser tool selected
- [ ] Press `Ctrl+Z` in ink mode → Last stroke undone
- [ ] Test on iPad with Apple Pencil → Pressure sensitivity works
- [ ] Export to PDF → Ink layer included

---

## 🎨 Visual Behavior

```
┌─────────────────────────────────────┐
│  [✍️ Ink Mode] [Pen] [Eraser] ...  │ ← Ink Toolbar
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════╗     │
│  ║ Ink Canvas Overlay        ║     │ ← Transparent when ink mode OFF
│  ║ (z-index: 10)             ║     │   Captures pointer when ON
│  ╚═══════════════════════════╝     │
│                                     │
│  ┌───────────────────────────┐     │
│  │ Regular Text Content      │     │ ← TipTap editor underneath
│  │ ☑ Checkbox item           │     │   Clickable when ink mode OFF
│  │ More text...              │     │
│  └───────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚨 Important Notes

1. **Ink mode disables text editing** - Users can't type while drawing
2. **Pointer events** - Canvas uses `pointer-events: auto` when active, `none` when inactive
3. **Z-index** - Ink canvas is `z-10`, sits above editor content
4. **Performance** - Konva lazy-loads only when ink mode is first activated
5. **Persistence** - Strokes save to `inkStrokes` field on note document

---

## 🎉 You're Done!

Now you have a full-canvas ink overlay that works like Excalidraw! Users can:
- Toggle ink mode with `I`
- Draw freely over the entire note
- Switch back to text editing seamlessly
- Have ink persist across sessions
- Export notes with ink included

**This is the correct implementation you wanted!** 🚀
