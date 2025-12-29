# Quick Start Guide - Live Handwriting Feature

## ✅ Packages Installed

- `konva@10.0.12` - Canvas drawing library
- `react-konva@19.2.1` - React bindings for Konva

---

## 🚀 Quick Integration (5 Steps)

### Step 1: Update NoteEditor.tsx

Open `src/components/NoteEditor.tsx` and add the HandwritingNode extension:

```typescript
// Add this import at the top
import { HandwritingNode } from './editor/extensions/HandwritingNode';

// In the useEditor configuration (around line 113), add HandwritingNode to extensions:
const editor = useEditor({
    immediatelyRender: false,
    extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Underline,
        TextStyle,
        Color,
        FontFamily,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Link.configure({ openOnClick: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        CodeBlock,
        Image,
        TagNode,
        HandwritingNode, // ← ADD THIS LINE
        Placeholder.configure({ placeholder: 'Start writing your masterpiece...' }),
    ],
    content: note?.content || '',
    editable: isEditing,
    onCreate: ({ editor }) => {
        // Store note ID for handwriting blocks
        editor.storage.noteId = note?.id;
    },
    onUpdate: ({ editor }) => {
        // Update note ID on content changes
        editor.storage.noteId = note?.id;
        
        // ... rest of your existing onUpdate logic
        const text = editor.getText();
        setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
        // ... etc
    },
});
```

### Step 2: Remove Old Drawing Code

In `NoteEditor.tsx`, remove or comment out the old canvas drawing code:

**Remove these state variables (around line 65-67):**
```typescript
// DELETE THESE LINES:
const [isDrawing, setIsDrawing] = useState(false);
const canvasRef = useRef<HTMLCanvasElement>(null);
const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);
```

**Remove these functions (around line 412-441):**
```typescript
// DELETE THESE FUNCTIONS:
const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => { ... }
const draw = (e: React.MouseEvent<HTMLCanvasElement>) => { ... }
const insertDrawing = () => { ... }
```

**Remove the old canvas UI (around line 504-531):**
```typescript
// DELETE THIS ENTIRE BLOCK:
{isDrawing && (
    <div className="mb-4 p-3 md:p-4 bg-[#fffef5] rounded-xl md:rounded-2xl border-2 border-[#ffd700]">
        <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full border-2 border-dashed border-black/20 rounded-xl cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={() => setIsCanvasDrawing(false)}
            onMouseLeave={() => setIsCanvasDrawing(false)}
        />
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 800, 200)}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
            >
                Clear
            </button>
            <button
                onClick={insertDrawing}
                className="px-3 py-1 text-xs bg-[#ffd700] hover:bg-[#ffed4e] text-black rounded-lg transition-colors font-semibold"
            >
                Insert
            </button>
        </div>
    </div>
)}
```

### Step 3: Update EditorToolbar.tsx (Optional)

In `src/components/editor/EditorToolbar.tsx`, remove the old drawing button and optionally add a new handwriting button:

**Find and remove (around line 478-480 in NoteEditor):**
```typescript
// In EditorToolbar props, remove:
isDrawing={isDrawing}
setIsDrawing={setIsDrawing}
```

**Optionally add a handwriting button in EditorToolbar.tsx:**
```typescript
<button
    onClick={() => {
        const blockId = `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        editor?.chain().focus().insertHandwritingBlock({ 
            blockId, 
            width: 800, 
            height: 400 
        }).run();
    }}
    className="p-2 hover:bg-[#ffd700]/20 rounded-lg transition-colors"
    title="Add Handwriting Block"
>
    ✍️
</button>
```

### Step 4: Test the Feature

1. **Start the dev server:**
   ```bash
   bun run dev
   ```

2. **Create or open a note**

3. **Type `/handwrite` and press Enter** - This will insert a handwriting block

4. **Draw with your mouse or stylus** - Try drawing, erasing, changing colors

5. **Save and reload** - Verify your handwriting persists

### Step 5: Update Firestore Rules (If Needed)

Add rules for the handwritingBlocks subcollection in `firestore.rules`:

```javascript
match /users/{userId}/notes/{noteId}/handwritingBlocks/{blockId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

---

## 🎨 How to Use

### Creating a Handwriting Block

**Method 1: Slash Command**
1. Type `/handwrite` in the editor
2. Press Enter
3. Start drawing!

**Method 2: Toolbar Button** (if you added it)
1. Click the ✍️ button
2. Start drawing!

### Drawing Tools

- **Pen Tool**: Press `P` or click "Pen" button
- **Eraser Tool**: Press `E` or click "Eraser" button
- **Undo**: Press `Ctrl+Z` (or `Cmd+Z` on Mac)
- **Redo**: Press `Ctrl+Y` (or `Cmd+Shift+Z` on Mac)
- **Clear All**: Click "Clear" button
- **Delete Block**: Click "Delete Block" button

### Color Selection

Click any preset color or use the color picker for custom colors.

---

## 📤 Exporting with Handwriting

The handwriting export functions are ready to use. Update your export handlers:

```typescript
// In EditorHeader.tsx or wherever you handle exports
import { exportNoteToPDF } from '@/utils/exportHandwritingToPDF';
import { exportNoteToWord } from '@/utils/exportHandwritingToWord';

// For PDF export:
const handleExportPDF = async () => {
    if (!user || !note) return;
    try {
        await exportNoteToPDF(user.uid, note.id, note.title, editor.getHTML());
        showToast('PDF exported successfully! 📄', 'success');
    } catch (error) {
        showToast('Failed to export PDF. 😢', 'error');
    }
};

// For Word export:
const handleExportWord = async () => {
    if (!user || !note) return;
    try {
        await exportNoteToWord(user.uid, note.id, note.title, editor.getHTML());
        showToast('Word document exported successfully! 📝', 'success');
    } catch (error) {
        showToast('Failed to export Word. 😢', 'error');
    }
};
```

---

## 🧪 Testing Checklist

- [ ] Type `/handwrite` - handwriting block appears
- [ ] Draw with mouse - smooth strokes appear
- [ ] Use eraser - strokes are removed
- [ ] Press `Ctrl+Z` - undo works
- [ ] Press `Ctrl+Y` - redo works
- [ ] Change color - new strokes use new color
- [ ] Save note and reload - handwriting persists
- [ ] Export to PDF - handwriting appears in PDF
- [ ] Test on iPad with Apple Pencil - pressure sensitivity works

---

## 🐛 Troubleshooting

### "Cannot find module HandwritingNode"
- Make sure the file exists at `src/components/editor/extensions/HandwritingNode.ts`
- Restart your dev server

### Handwriting doesn't save
- Check browser console for errors
- Verify Firestore rules allow handwritingBlocks subcollection
- Ensure `editor.storage.noteId` is set correctly

### Export doesn't include handwriting
- Verify you're using the new export functions from `exportHandwritingToPDF.ts` and `exportHandwritingToWord.ts`
- Check that handwriting blocks are saved to Firestore

### Konva not loading
- Check browser console for import errors
- Clear cache and reload: `Ctrl+Shift+R`

---

## 📚 Next Steps

1. **Complete Step 1-3 above** to integrate the feature
2. **Test basic functionality** with `/handwrite` command
3. **Test on iPad** with Apple Pencil for pressure sensitivity
4. **Update export functions** to include handwriting
5. **Deploy to production** after thorough testing

---

## 🎉 You're Ready!

The handwriting feature is now fully implemented. Just follow the integration steps above and you'll have a powerful, iPad-friendly handwriting system in your notes app!

**Key Features:**
- ✍️ Real-time drawing with pressure sensitivity
- 🎨 Multiple colors and tools
- 💾 Auto-save to Firestore
- 📤 PDF/Word export support
- ⚡ Lazy-loaded for performance
- 🖐️ Palm rejection for iPad

Happy drawing! 🎨
