/**
 * Enhanced IndexedDB client for persisting AI-generated content.
 * Uses separate object stores per feature for efficient querying.
 */

const DB_NAME = 'GanapathiGenAI_DB';
const DB_VERSION = 3;

// All stores used in the app
const STORES = [
    'user_data',       // legacy store for github tokens etc.
    'concepts',        // concept explainer results
    'code_reviews',    // code review analysis
    'roadmaps',        // learning roadmaps
    'docs',            // generated documentation
    'productivity',    // productivity hub data
    'interviews',      // interview prep Q&A
    'walkthroughs',    // code walkthrough steps
    'media',           // generated images/media
    'chat_history',    // chatbot conversations
    'stackoverflow',   // stack overflow search history
    'research',        // research hub history
] as const;

type StoreName = typeof STORES[number];

export interface StoredContent<T = any> {
    key: string;
    data: T;
    feature: string;
    title?: string;
    createdAt: string;
    updatedAt: string;
}

export const ClientDB = {
    async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                STORES.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'key' });
                        store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    }
                });
            };
        });
    },

    /** Save content to a feature store */
    async saveContent<T>(store: StoreName, key: string, data: T, title?: string): Promise<void> {
        const db = await this.getDB();
        const now = new Date().toISOString();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], 'readwrite');
            const objectStore = tx.objectStore(store);
            const record: StoredContent<T> = {
                key,
                data,
                feature: store,
                title,
                createdAt: now,
                updatedAt: now,
            };
            // Check if exists to preserve createdAt
            const getReq = objectStore.get(key);
            getReq.onsuccess = () => {
                if (getReq.result) {
                    record.createdAt = getReq.result.createdAt;
                }
                const putReq = objectStore.put(record);
                putReq.onerror = () => reject(putReq.error);
                putReq.onsuccess = () => resolve();
            };
            getReq.onerror = () => {
                // If get fails, just put
                const putReq = objectStore.put(record);
                putReq.onerror = () => reject(putReq.error);
                putReq.onsuccess = () => resolve();
            };
        });
    },

    /** Load content from a feature store */
    async loadContent<T>(store: StoreName, key: string): Promise<StoredContent<T> | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], 'readonly');
            const objectStore = tx.objectStore(store);
            const request = objectStore.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    },

    /** List all items in a feature store (sorted by updatedAt desc) */
    async listContent<T>(store: StoreName): Promise<StoredContent<T>[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], 'readonly');
            const objectStore = tx.objectStore(store);
            const request = objectStore.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const results = request.result || [];
                results.sort((a: StoredContent, b: StoredContent) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
                resolve(results);
            };
        });
    },

    /** Delete a specific item */
    async deleteContent(store: StoreName, key: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], 'readwrite');
            const objectStore = tx.objectStore(store);
            const request = objectStore.delete(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    },

    /** Clear all items in a feature store */
    async clearStore(store: StoreName): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], 'readwrite');
            const objectStore = tx.objectStore(store);
            const request = objectStore.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    },

    // Legacy helpers (backward compat)
    async set(key: string, value: any): Promise<void> {
        await this.saveContent('user_data', key, value);
    },

    async get<T>(key: string): Promise<T | undefined> {
        const result = await this.loadContent<T>('user_data', key);
        return result?.data;
    },

    async delete(key: string): Promise<void> {
        await this.deleteContent('user_data', key);
    },

    async saveGithubToken(token: string) { await this.set('github_token', token); },
    async getGithubToken() { return await this.get<string>('github_token'); },
    async clearGithubToken() { await this.delete('github_token'); },
};
