'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/userService';

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const userProfile = await getUserProfile(user.uid);
                setProfile(userProfile);
                setError(null);
            } catch (err) {
                console.error('Error loading user profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user]);

    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) {
            throw new Error('No user logged in');
        }

        try {
            await updateUserProfile(user.uid, data);
            // Reload profile after update
            const updatedProfile = await getUserProfile(user.uid);
            setProfile(updatedProfile);
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    return {
        profile,
        loading,
        error,
        updateProfile,
    };
}
