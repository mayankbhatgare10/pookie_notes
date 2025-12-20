import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

/**
 * Clean up old test data from Firestore
 * Run this once to remove all test collections and notes
 */
export async function cleanupOldData(userId: string) {
    if (!db) {
        console.error('Firestore is not initialized');
        return;
    }

    try {
        console.log('🧹 Starting cleanup...');

        // Delete all collections for this user
        const collectionsQuery = query(
            collection(db, 'collections'),
            where('userId', '==', userId)
        );
        const collectionsSnapshot = await getDocs(collectionsQuery);

        console.log(`Found ${collectionsSnapshot.size} collections to delete`);

        for (const docSnapshot of collectionsSnapshot.docs) {
            await deleteDoc(doc(db, 'collections', docSnapshot.id));
            console.log(`✅ Deleted collection: ${docSnapshot.data().name}`);
        }

        // Delete all notes for this user
        const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', userId)
        );
        const notesSnapshot = await getDocs(notesQuery);

        console.log(`Found ${notesSnapshot.size} notes to delete`);

        for (const docSnapshot of notesSnapshot.docs) {
            await deleteDoc(doc(db, 'notes', docSnapshot.id));
            console.log(`✅ Deleted note: ${docSnapshot.data().title}`);
        }

        console.log('🎉 Cleanup complete! Refresh the page.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

// To use this:
// 1. Import this function in your component
// 2. Call it with your user ID
// 3. Example: cleanupOldData(user.uid)
