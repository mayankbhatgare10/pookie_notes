'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
    linkNotes as linkNotesService,
    unlinkNotes as unlinkNotesService,
    getConnectedNotes as getConnectedNotesService,
    syncCompletedItems as syncCompletedItemsService,
    LinkNotesParams,
} from '@/lib/noteLinksService';
import { Note } from './useNotes';

export function useNoteLinks() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const linkNotes = async (params: Omit<LinkNotesParams, 'userId'>) => {
        if (!user) {
            showToast('You must be logged in to link notes', 'error');
            return;
        }

        setLoading(true);
        try {
            await linkNotesService({
                ...params,
                userId: user.uid,
            });
            showToast('Notes linked successfully! 🔗', 'success');
        } catch (error) {
            console.error('Error linking notes:', error);
            showToast('Failed to link notes. Try again! 😅', 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const unlinkNotes = async (sourceNoteId: string, targetNoteId: string) => {
        if (!user) {
            showToast('You must be logged in to unlink notes', 'error');
            return;
        }

        setLoading(true);
        try {
            await unlinkNotesService(user.uid, sourceNoteId, targetNoteId);
            showToast('Notes unlinked successfully! 🔓', 'success');
        } catch (error) {
            console.error('Error unlinking notes:', error);
            showToast('Failed to unlink notes. Try again! 😅', 'error');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getConnectedNotes = async (noteId: string): Promise<Note[]> => {
        if (!user) {
            return [];
        }

        try {
            return await getConnectedNotesService(user.uid, noteId);
        } catch (error) {
            console.error('Error fetching connected notes:', error);
            return [];
        }
    };

    const syncCompletedItems = async (sourceNoteId: string, sourceContent: string) => {
        if (!user) {
            return;
        }

        try {
            await syncCompletedItemsService(user.uid, sourceNoteId, sourceContent);
        } catch (error) {
            console.error('Error syncing completed items:', error);
        }
    };

    return {
        linkNotes,
        unlinkNotes,
        getConnectedNotes,
        syncCompletedItems,
        loading,
    };
}
