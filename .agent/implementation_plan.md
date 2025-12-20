# Implementation Plan: Note Management Functionality

## Issues to Fix

### 1. New Note Creation Not Working
- **Problem**: NewNoteModal doesn't actually create notes
- **Solution**: Implement `handleCreateNote` function in Dashboard that:
  - Generates unique note ID
  - Creates note object with all properties
  - Adds to notes state array
  - Closes modal

### 2. Delete Functionality Not Working
- **Problem**: Delete button doesn't remove notes
- **Solution**: Implement `handleDeleteNote` function that:
  - Filters out note by ID from notes array
  - Updates state

### 3. Note Viewing/Editing Flow
- **Problem**: Clicking card should show note content, not immediately edit
- **Solution**: 
  - Add `isEditing` mode to NoteEditor
  - Show read-only view by default
  - Add "Edit" button to switch to edit mode
  - Save button only appears in edit mode

### 4. Save Functionality Not Working
- **Problem**: Save button doesn't persist changes
- **Solution**: Implement `handleSaveNote` function that:
  - Updates note in notes array by ID
  - Saves title and content
  - Updates lastEdited timestamp
  - Closes editor or switches back to view mode

### 5. Export Options
- **Problem**: Only share button exists, no export
- **Solution**: Add export dropdown with:
  - Export to Word (.docx)
  - Export to PDF
  - Export to CSV (for note metadata)
  - Use libraries: html-docx-js, jsPDF, or similar

### 6. Inconsistent Notes Across Pages
- **Problem**: Notes are different in "All Notes" vs Collections
- **Solution**:
  - Use single source of truth (notes state in Dashboard)
  - Filter notes by collectionId for collection views
  - Pass same note data to all components
  - Ensure NoteCard component is consistent everywhere

## Implementation Steps

### Phase 1: Core CRUD Operations (Priority: HIGH)
1. ✅ Add note content field to note data structure
2. ✅ Implement handleCreateNote in Dashboard
3. ✅ Implement handleDeleteNote in Dashboard  
4. ✅ Implement handleSaveNote in Dashboard
5. ✅ Connect NewNoteModal to handleCreateNote
6. ✅ Connect NoteCard delete to handleDeleteNote
7. ✅ Connect NoteEditor save to handleSaveNote

### Phase 2: View/Edit Mode (Priority: HIGH)
1. ✅ Add isEditing state to NoteEditor
2. ✅ Create read-only view mode UI
3. ✅ Add Edit button in view mode
4. ✅ Toggle between view/edit modes
5. ✅ Show Save button only in edit mode

### Phase 3: Export Functionality (Priority: MEDIUM)
1. ✅ Create export dropdown component
2. ✅ Implement Word export
3. ✅ Implement PDF export
4. ✅ Implement CSV export
5. ✅ Replace share button with export dropdown

### Phase 4: Data Consistency (Priority: HIGH)
1. ✅ Add content field to all sample notes
2. ✅ Ensure notes filter correctly by collectionId
3. ✅ Verify NoteCard renders consistently
4. ✅ Test note operations across all views

## Data Structure Updates

### Note Object
```typescript
interface Note {
  id: string;
  title: string;
  content: string; // HTML content from TipTap editor
  color: string;
  lastEdited: string;
  isStarred: boolean;
  isArchived: boolean;
  collectionId: string | null;
  isPrivate: boolean;
  createdAt: string; // ISO timestamp
}
```

## Files to Modify
1. `components/Dashboard.tsx` - Add CRUD functions, pass to children
2. `components/NoteEditor.tsx` - Add view/edit modes, save functionality, export
3. `components/NewNoteModal.tsx` - Connect to create function
4. `components/NoteCard.tsx` - Ensure consistency, connect delete
