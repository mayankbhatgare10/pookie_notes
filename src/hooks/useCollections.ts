'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserCollections,
    createCollection as createCollectionService,
    updateCollection as updateCollectionService,
    deleteCollection as deleteCollectionService,
    addTagToCollection,
    removeTagFromCollection,
    CreateCollectionData,
    UpdateCollectionData,
} from '@/lib/collectionsService';
import {
    deleteCollectionWithNotes,
    getCollectionNoteCount,
} from '@/lib/collectionNotesHelper';

export interface Collection {
    id: string;
    name: string;
    emoji: string;
    tags: string[];
    isPrivate?: boolean;
    passwordHash?: string;
}

export const useCollections = () => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    // Load collections when user changes
    useEffect(() => {
        if (user) {
            loadCollections();
        } else {
            setCollections([]);
            setLoading(false);
        }
    }, [user]);

    const loadCollections = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userCollections = await getUserCollections(user.uid);

            // Convert Firebase collections to UI format
            const formattedCollections = userCollections.map(collection => ({
                id: collection.id,
                name: collection.name,
                emoji: collection.emoji,
                tags: collection.tags,
                isPrivate: collection.isPrivate,
                passwordHash: collection.passwordHash,
            }));

            setCollections(formattedCollections);
        } catch (error) {
            console.error('Error loading collections:', error);
            showToast('Failed to load collections. Please try again. 😢', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async (collectionData: CreateCollectionData): Promise<Collection> => {
        if (!user) {
            throw new Error('User must be logged in to create collections');
        }

        try {
            const newCollection = await createCollectionService(user.uid, collectionData);

            const formattedCollection: Collection = {
                id: newCollection.id,
                name: newCollection.name,
                emoji: newCollection.emoji,
                tags: newCollection.tags,
                isPrivate: newCollection.isPrivate,
                passwordHash: newCollection.passwordHash,
            };

            setCollections([...collections, formattedCollection]);
            showToast(`Collection "${collectionData.name}" created! Time to hoard some notes. 📂`, 'success');

            return formattedCollection;
        } catch (error) {
            console.error('Error creating collection:', error);
            showToast('Failed to create collection. Please try again. 😢', 'error');
            throw error;
        }
    };

    const handleUpdateCollection = async (collectionId: string, updates: UpdateCollectionData) => {
        try {
            await updateCollectionService(collectionId, updates);

            setCollections(collections.map(collection =>
                collection.id === collectionId
                    ? { ...collection, ...updates }
                    : collection
            ));

            showToast('Collection updated! Looking good. ✨', 'success');
        } catch (error) {
            console.error('Error updating collection:', error);
            showToast('Failed to update collection. Please try again. 😢', 'error');
        }
    };

    const handleDeleteCollection = async (collectionId: string) => {
        const collection = collections.find(c => c.id === collectionId);

        try {
            await deleteCollectionService(collectionId);
            setCollections(collections.filter(c => c.id !== collectionId));
            showToast(`"${collection?.name || 'Collection'}" deleted! Poof, it's gone. 🗑️`, 'success');
        } catch (error) {
            console.error('Error deleting collection:', error);
            showToast('Failed to delete collection. Please try again. 😢', 'error');
        }
    };

    const handleAddTag = async (collectionId: string, tag: string) => {
        try {
            await addTagToCollection(collectionId, tag);

            setCollections(collections.map(collection =>
                collection.id === collectionId
                    ? { ...collection, tags: [...collection.tags, tag] }
                    : collection
            ));

            showToast(`Tag "${tag}" added! Organization level up! 🏷️`, 'success');
        } catch (error) {
            console.error('Error adding tag:', error);
            showToast('Failed to add tag. Please try again. 😢', 'error');
        }
    };

    const handleRemoveTag = async (collectionId: string, tag: string) => {
        try {
            await removeTagFromCollection(collectionId, tag);

            setCollections(collections.map(collection =>
                collection.id === collectionId
                    ? { ...collection, tags: collection.tags.filter(t => t !== tag) }
                    : collection
            ));

            showToast(`Tag "${tag}" removed! Decluttering in progress. 🧹`, 'info');
        } catch (error) {
            console.error('Error removing tag:', error);
            showToast('Failed to remove tag. Please try again. 😢', 'error');
        }
    };

    const handleDeleteCollectionWithNotes = async (
        collectionId: string,
        action: 'delete' | 'move',
        targetCollectionId?: string
    ) => {
        if (!user) return;

        const collection = collections.find(c => c.id === collectionId);

        try {
            await deleteCollectionWithNotes(user.uid, collectionId, action, targetCollectionId);
            setCollections(collections.filter(c => c.id !== collectionId));

            if (action === 'move') {
                showToast(`\"${collection?.name || 'Collection'}\" deleted and notes moved! Smooth operator. 😎`, 'success');
            } else {
                showToast(`\"${collection?.name || 'Collection'}\" and all its notes deleted! Scorched earth! 🔥`, 'success');
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
            showToast('Failed to delete collection. The universe said no. 😢', 'error');
        }
    };

    return {
        collections,
        loading,
        handleCreateCollection,
        handleUpdateCollection,
        handleDeleteCollection,
        handleDeleteCollectionWithNotes,
        getCollectionNoteCount: (collectionId: string) =>
            user ? getCollectionNoteCount(user.uid, collectionId) : Promise.resolve(0),
        handleAddTag,
        handleRemoveTag,
        refreshCollections: loadCollections,
    };
};
