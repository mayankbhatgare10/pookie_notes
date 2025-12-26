# Interconnected Notes Feature - Implementation Guide

## Overview
This document provides the complete implementation for the interconnected notes feature in Pookie Notes.

## Firebase Security Rules

Copy and paste this into your Firebase Console (Firestore Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data rules
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Notes collection
      match /notes/{noteId} {
        // Allow read/write if user is authenticated and owns the note
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Validate connected notes structure
        allow update: if request.auth != null 
          && request.auth.uid == userId
          && (
            // If connectedNotes field exists, validate it
            !request.resource.data.keys().hasAny(['connectedNotes']) ||
            (
              request.resource.data.connectedNotes is list &&
              request.resource.data.connectedNotes.size() <= 50 && // Max 50 connections
              // Validate each connection has required fields
              request.resource.data.connectedNotes.hasAll(['noteId', 'connectionType', 'createdAt'])
            )
          );
      }
      
      // Collections
      match /collections/{collectionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User profile
      match /profile/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Files Created

### 1. `src/lib/noteLinksService.ts`
Service for managing note connections and syncing completed items.

**Key Functions:**
- `linkNotes()` - Create connection between two notes
- `unlinkNotes()` - Remove connection
- `getConnectedNotes()` - Fetch all connected notes
- `syncCompletedItems()` - Auto-sync completed checklist items

### 2. `src/hooks/useNoteLinks.ts`
React hook for note linking operations with error handling.

### 3. `src/components/LinkNoteModal.tsx`
Modal UI for linking notes with connection type selection.

### 4. `src/components/NoteInfoPanel.tsx`
Sliding panel showing note metadata and connections.

## Integration Steps

### Step 1: Update NoteEditor Component

Add these imports to `src/components/NoteEditor.tsx`:

```typescript
import LinkNoteModal from './LinkNoteModal';
import NoteInfoPanel from './NoteInfoPanel';
import { useNoteLinks } from '@/hooks/useNoteLinks';
import { Note } from '@/hooks/useNotes';
```

Add state variables:

```typescript
const [showActionsMenu, setShowActionsMenu] = useState(false);
const [showLinkModal, setShowLinkModal] = useState(false);
const [showInfoPanel, setShowInfoPanel] = useState(false);
const [connectedNotes, setConnectedNotes] = useState<Note[]>([]);
const actionsMenuRef = useRef<HTMLDivElement>(null);

const { linkNotes, unlinkNotes, getConnectedNotes, syncCompletedItems } = useNoteLinks();
```

Add effect to load connected notes:

```typescript
useEffect(() => {
  if (note?.id) {
    loadConnectedNotes();
  }
}, [note?.id]);

const loadConnectedNotes = async () => {
  if (!note?.id) return;
  const notes = await getConnectedNotes(note.id);
  setConnectedNotes(notes);
};
```

Add handlers:

```typescript
const handleLinkNote = async (
  targetNoteId: string,
  connectionType: 'completion-sync' | 'reference' | 'bidirectional',
  autoSync: boolean
) => {
  if (!note?.id) return;
  
  await linkNotes({
    sourceNoteId: note.id,
    targetNoteId,
    connectionType,
    autoSync,
  });
  
  await loadConnectedNotes();
};

const handleUnlinkNote = async (targetNoteId: string) => {
  if (!note?.id) return;
  await unlinkNotes(note.id, targetNoteId);
  await loadConnectedNotes();
};

const handleNavigateToNote = (noteId: string) => {
  // Navigate to the selected note
  const targetNote = connectedNotes.find(n => n.id === noteId);
  if (targetNote && onSave) {
    // Save current note first
    onSave(note.id, title, editor?.getHTML() || '');
    // Then open the target note
    // You'll need to pass this up to DashboardPage to handle
  }
};

const handleShare = () => {
  if (!note) return;
  
  const formatContent = (html: string) => {
    // Same formatting logic from DashboardPage
    // ... (copy from DashboardPage.tsx)
  };
  
  const formattedContent = formatContent(note.content || '');
  const shareText = `${note.title}\n\n${formattedContent}`;
  
  if (navigator.share) {
    navigator.share({
      title: note.title,
      text: shareText,
    });
  } else {
    navigator.clipboard.writeText(shareText);
    showToast('Note copied to clipboard! 📋', 'success');
  }
};

// Auto-sync on save
const handleSaveWithSync = async () => {
  if (!note?.id || !editor) return;
  
  const content = editor.getHTML();
  
  // Save the note
  if (onSave) {
    onSave(note.id, title, content);
  }
  
  // Sync completed items if there are connections
  if (note.connectedNotes?.some(conn => conn.connectionType === 'completion-sync')) {
    await syncCompletedItems(note.id, content);
  }
  
  setIsEditing(false);
};
```

Replace the header section (around line 160-200) with:

```typescript
{/* Header */}
<div className="sticky top-0 bg-white border-b border-[#e0e0e0] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-10">
  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="flex-1 text-lg md:text-xl font-bold bg-transparent border-none outline-none text-black placeholder-[#999] mr-4"
    placeholder="Untitled"
    disabled={!isEditing}
  />

  <div className="flex items-center gap-2">
    {/* Word Count */}
    <span className="text-xs text-[#999] hidden md:block">{wordCount} words</span>

    {/* Info Button */}
    <button
      onClick={() => setShowInfoPanel(true)}
      className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors relative"
      title="Note info"
    >
      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {(note?.metadata?.totalConnections || 0) > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffd700] border border-black rounded-full text-[10px] font-bold flex items-center justify-center">
          {note.metadata.totalConnections}
        </span>
      )}
    </button>

    {/* Save/Edit Button */}
    <button
      onClick={handleSaveWithSync}
      className="px-3 md:px-5 py-1.5 md:py-2.5 bg-[#ffd700] hover:bg-[#ffed4e] text-black font-bold text-xs md:text-sm rounded-xl md:rounded-2xl transition-colors shadow-md flex items-center gap-1 md:gap-2"
    >
      {isEditing ? 'Save' : 'Edit'}
    </button>

    {/* Export Button */}
    <div className="relative">
      <button
        ref={setExportButtonRef}
        onClick={() => setShowExportMenu(true)}
        className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors"
      >
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
      <ExportMenu
        editor={editor}
        title={title}
        wordCount={wordCount}
        isOpen={showExportMenu}
        onClose={() => setShowExportMenu(false)}
        position={exportButtonRef ? { top: exportButtonRef.getBoundingClientRect().bottom + 8, left: exportButtonRef.getBoundingClientRect().left } : { top: 0, left: 0 }}
      />
    </div>

    {/* 3-Dot Actions Menu */}
    <div className="relative" ref={actionsMenuRef}>
      <button
        onClick={() => setShowActionsMenu(!showActionsMenu)}
        className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors"
      >
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {showActionsMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e0e0e0] py-1 z-10">
          <button
            onClick={() => {
              handleShare();
              setShowActionsMenu(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <button
            onClick={() => {
              setShowLinkModal(true);
              setShowActionsMenu(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-[#f5f4e8] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Link to Note
          </button>

          <div className="border-t border-[#e0e0e0] my-1"></div>

          <button
            onClick={() => {
              if (note && onDelete) {
                onDelete(note.id);
              }
              setShowActionsMenu(false);
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>

    {/* Close Button */}
    <button
      onClick={onClose}
      className="p-1.5 md:p-2.5 hover:bg-black/5 rounded-xl transition-colors"
    >
      <svg className="w-4 h-4 md:w-5 md:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>
```

Add modals at the end of the component (before the closing tags):

```typescript
{/* Link Note Modal */}
<LinkNoteModal
  isOpen={showLinkModal}
  onClose={() => setShowLinkModal(false)}
  currentNote={note}
  availableNotes={[]} // Pass all notes from parent
  onLink={handleLinkNote}
/>

{/* Note Info Panel */}
<NoteInfoPanel
  isOpen={showInfoPanel}
  onClose={() => setShowInfoPanel(false)}
  note={note}
  connectedNotes={connectedNotes}
  onNavigateToNote={handleNavigateToNote}
  onUnlinkNote={handleUnlinkNote}
/>
```

### Step 2: Update DashboardPage

Pass all notes to NoteEditor:

```typescript
<NoteEditor
  isOpen={showNoteEditor}
  onClose={() => setShowNoteEditor(false)}
  note={currentNote}
  onSave={handleSaveNote}
  onDelete={handleDeleteNote}
  collectionTags={collectionTags}
  allNotes={notes} // Add this prop
/>
```

### Step 3: Update notesService.ts

Ensure metadata is initialized when creating notes:

```typescript
// In createNote function, add:
metadata: {
  createdAt: now,
  lastModified: now,
  totalConnections: 0,
}
```

## Usage Example

1. **Link Notes:**
   - Open a note in editor
   - Click 3-dot menu → "Link to Note"
   - Select target note and connection type
   - Choose "Completion Sync" for bucket list → watched movies

2. **Auto-Sync:**
   - In bucket list, check off a movie: ☑ Inception
   - Save the note
   - Automatically added to "Watched Movies" note

3. **View Connections:**
   - Click info (i) button
   - See all connected notes
   - Click to navigate between notes

## Testing

1. Create two notes: "Bucket List" and "Watched Movies"
2. Link them with "Completion Sync"
3. Add checklist items to Bucket List
4. Mark items as complete
5. Save and check Watched Movies - items should appear

## Notes

- Maximum 50 connections per note (Firebase rule)
- Auto-sync only works for "completion-sync" type
- Bidirectional connections work both ways
- Reference connections are one-way links
