import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

/**
 * Migrate old notes to new format
 * Run this once to fix old notes that don't match current Firebase rules
 */
export async function migrateOldNotes(userId: string) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }

    try {
        console.log('🔄 Starting migration for user:', userId);

        let notesMigrated = 0;
        let notesErrors = 0;
        let collectionsMigrated = 0;
        let collectionsErrors = 0;

        // Migrate Notes
        const notesRef = collection(db, 'users', userId, 'notes');
        const notesSnapshot = await getDocs(notesRef);

        for (const noteDoc of notesSnapshot.docs) {
            try {
                const noteData = noteDoc.data();
                const updates: any = {};
                let needsUpdate = false;

                // Remove updatedAt if it exists
                if (noteData.updatedAt) {
                    updates.updatedAt = deleteField();
                    needsUpdate = true;
                }

                // Convert lastEdited to ISO string if it's a timestamp
                if (noteData.lastEdited && typeof noteData.lastEdited !== 'string') {
                    const date = noteData.lastEdited.toDate ? noteData.lastEdited.toDate() : new Date();
                    updates.lastEdited = date.toISOString();
                    needsUpdate = true;
                }

                // Remove metadata if it exists (now optional)
                if (noteData.metadata) {
                    updates.metadata = deleteField();
                    needsUpdate = true;
                }

                // Ensure connectedNotes exists
                if (!noteData.connectedNotes) {
                    updates.connectedNotes = [];
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await updateDoc(doc(db, 'users', userId, 'notes', noteDoc.id), updates);
                    notesMigrated++;
                    console.log(`✅ Migrated note: ${noteDoc.id}`);
                }
            } catch (error) {
                console.error(`❌ Error migrating note ${noteDoc.id}:`, error);
                notesErrors++;
            }
        }

        // Migrate Collections
        const collectionsRef = collection(db, 'users', userId, 'collections');
        const collectionsSnapshot = await getDocs(collectionsRef);

        for (const collectionDoc of collectionsSnapshot.docs) {
            try {
                const collectionData = collectionDoc.data();
                const updates: any = {};
                let needsUpdate = false;

                // Remove any invalid fields
                if (collectionData.updatedAt) {
                    updates.updatedAt = deleteField();
                    needsUpdate = true;
                }

                // Ensure tags is an array
                if (!collectionData.tags) {
                    updates.tags = [];
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await updateDoc(doc(db, 'users', userId, 'collections', collectionDoc.id), updates);
                    collectionsMigrated++;
                    console.log(`✅ Migrated collection: ${collectionDoc.id}`);
                }
            } catch (error) {
                console.error(`❌ Error migrating collection ${collectionDoc.id}:`, error);
                collectionsErrors++;
            }
        }

        console.log(`🎉 Migration complete!`);
        console.log(`   Notes: ${notesMigrated} migrated, ${notesErrors} errors`);
        console.log(`   Collections: ${collectionsMigrated} migrated, ${collectionsErrors} errors`);

        return {
            migratedCount: notesMigrated + collectionsMigrated,
            errorCount: notesErrors + collectionsErrors,
            notesMigrated,
            collectionsMigrated
        };
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}
