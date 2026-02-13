/**
 * Unified content persistence hook.
 * Saves to IndexedDB (instant) + fires MongoDB sync (durable).
 * Loads from IndexedDB first (fast), falls back to MongoDB API.
 */
"use client"

import { useCallback } from 'react';
import { ClientDB, StoredContent } from './client-db';

type FeatureStore = 'concepts' | 'code_reviews' | 'roadmaps' | 'docs' | 'productivity' | 'interviews' | 'walkthroughs' | 'media' | 'chat_history';

/** Fire-and-forget MongoDB sync */
async function syncToMongo(feature: string, key: string, data: any, title?: string) {
    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ feature, key, data, title }),
        });
    } catch {
        // Silent fail — IndexedDB is primary, MongoDB is backup
    }
}

/** Load from MongoDB when IndexedDB is empty */
async function loadFromMongo<T>(feature: string, key: string): Promise<T | null> {
    try {
        const res = await fetch(`/api/content?feature=${feature}&key=${encodeURIComponent(key)}`, {
            credentials: 'include',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data || null;
    } catch {
        return null;
    }
}

/** Load list from MongoDB */
async function listFromMongo<T>(feature: string): Promise<StoredContent<T>[]> {
    try {
        const res = await fetch(`/api/content?feature=${feature}`, { credentials: 'include' });
        if (!res.ok) return [];
        const data = await res.json();
        return data?.items || [];
    } catch {
        return [];
    }
}

/**
 * React hook for feature content persistence.
 * Usage: const store = useContentStore('concepts');
 */
export function useContentStore(feature: FeatureStore) {
    const save = useCallback(async <T>(key: string, data: T, title?: string) => {
        // 1. Save to IndexedDB (instant)
        await ClientDB.saveContent(feature, key, data, title);
        // 2. Sync to MongoDB (fire-and-forget)
        syncToMongo(feature, key, data, title);
    }, [feature]);

    const load = useCallback(async <T>(key: string): Promise<T | null> => {
        // 1. Try IndexedDB first (fast)
        const local = await ClientDB.loadContent<T>(feature, key);
        if (local?.data) return local.data;
        // 2. Fall back to MongoDB
        const remote = await loadFromMongo<T>(feature, key);
        if (remote) {
            // Cache in IndexedDB for next time
            await ClientDB.saveContent(feature, key, remote);
        }
        return remote;
    }, [feature]);

    const list = useCallback(async <T>(): Promise<StoredContent<T>[]> => {
        // 1. Try IndexedDB first
        const local = await ClientDB.listContent<T>(feature);
        if (local.length > 0) return local;
        // 2. Fall back to MongoDB
        return await listFromMongo<T>(feature);
    }, [feature]);

    const remove = useCallback(async (key: string) => {
        await ClientDB.deleteContent(feature, key);
        // Also delete from MongoDB
        try {
            await fetch(`/api/content?feature=${feature}&key=${encodeURIComponent(key)}`, {
                method: 'DELETE',
                credentials: 'include',
            });
        } catch { /* silent */ }
    }, [feature]);

    const clear = useCallback(async () => {
        await ClientDB.clearStore(feature);
    }, [feature]);

    return { save, load, list, remove, clear };
}
