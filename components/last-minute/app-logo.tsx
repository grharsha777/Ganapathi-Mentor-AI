'use client';

import { useState, useEffect } from 'react';

/**
 * Extract the root domain from a full URL.
 * e.g. "https://www.canva.com/presentations/" → "canva.com"
 */
function getDomainFromUrl(url: string): string {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

/**
 * For tools hosted on subdomains of a parent brand, override to the canonical domain.
 */
const DOMAIN_OVERRIDES: Record<string, string> = {
    'colab.research.google.com': 'google.com',
    'notebooklm.google.com': 'google.com',
    'gemini.google.com': 'google.com',
    'slides.google.com': 'google.com',
    'pages.github.com': 'github.com',
    'chat.openai.com': 'openai.com',
    'chat.deepseek.com': 'deepseek.com',
    'grok.x.ai': 'x.ai',
    'copilot.microsoft.com': 'microsoft.com',
    'codeium.com': 'codeium.com',
};

interface AppLogoProps {
    toolName: string;
    toolUrl?: string;
    fallbackIcon?: string;
    className?: string;
    imgClassName?: string;
    size?: number;
}

export function AppLogo({
    toolName,
    toolUrl,
    fallbackIcon,
    className = '',
    imgClassName = '',
}: AppLogoProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    // Derive domain from URL
    const rawDomain = toolUrl ? getDomainFromUrl(toolUrl) : '';
    const domain = DOMAIN_OVERRIDES[rawDomain] || rawDomain;

    useEffect(() => {
        if (!domain) return;
        const cacheKey = `logo_${domain}`;

        // IDB helper inline for portability
        const getIDB = () => new Promise<string | null>((resolve) => {
            const req = indexedDB.open('AntigravityCacheDB', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('image-blobs');
            req.onsuccess = () => {
                const db = req.result;
                if (!db.objectStoreNames.contains('image-blobs')) return resolve(null);
                const tx = db.transaction('image-blobs', 'readonly');
                const g = tx.objectStore('image-blobs').get(cacheKey);
                g.onsuccess = () => resolve(g.result ? URL.createObjectURL(g.result) : null);
                g.onerror = () => resolve(null);
            };
            req.onerror = () => resolve(null);
        });

        const saveIDB = (blob: Blob) => new Promise<void>((resolve) => {
            const req = indexedDB.open('AntigravityCacheDB', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('image-blobs');
            req.onsuccess = () => {
                const tx = req.result.transaction('image-blobs', 'readwrite');
                tx.objectStore('image-blobs').put(blob, cacheKey);
                tx.oncomplete = () => resolve();
            };
        });

        let mounted = true;
        getIDB().then(localUrl => {
            if (localUrl && mounted) {
                setImgSrc(localUrl);
                return;
            }
            
            // Miss: fetch via proxy, convert to Blob, and cache
            const proxyUrl = `/api/assets/brand-logo?domain=${encodeURIComponent(domain)}`;
            fetch(proxyUrl)
                .then(res => res.ok ? res.blob() : Promise.reject())
                .then(blob => {
                    if (mounted) setImgSrc(URL.createObjectURL(blob));
                    saveIDB(blob);
                })
                .catch(() => { if (mounted) setImgError(true); });
        });

        return () => { mounted = false; };
    }, [domain]);

    // If we have a valid logo URL and it hasn't errored
    if (imgSrc && !imgError) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imgSrc}
                    alt={toolName}
                    className={`max-w-full max-h-full object-contain filter drop-shadow-md transition-all duration-300 ${imgClassName}`}
                    onError={() => setImgError(true)}
                    loading="lazy"
                />
            </div>
        );
    }

    // Styled letter fallback — generates a deterministic color from the name
    const initial = toolName.charAt(0).toUpperCase();
    let hash = 0;
    for (let i = 0; i < toolName.length; i++) {
        hash = toolName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    const bgColor = `hsl(${hue}, 55%, 50%)`;

    return (
        <div
            className={`flex items-center justify-center rounded-xl ${className}`}
            style={{ backgroundColor: bgColor + '20' }}
        >
            <span
                className={`font-black select-none ${imgClassName}`}
                style={{ color: bgColor, fontSize: 'inherit' }}
            >
                {initial}
            </span>
        </div>
    );
}
