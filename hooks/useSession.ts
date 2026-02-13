
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type Session = {
    id: string;
    started_at: string;
    ended_at: string | null;
    summary: string | null;
};

export function useSession(teamId?: string | null) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<Session[]>([]);

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId })
            });
            if (res.ok) {
                const data = await res.json();
                setSession(data);
            }
        } catch (error) {
            console.error("Failed to start/fetch session", error);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    const endSession = async () => {
        try {
            toast.info("Ending session and generating summary...");
            const res = await fetch('/api/session/end', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                toast.success("Session summarized!", { description: data.summary });
                setSession(null);
                // Refresh history or current session state
                // In a real app we might refetch history here
            } else {
                toast.error("Failed to end session");
            }
        } catch (error) {
            toast.error("Error ending session");
        }
    };

    // Initial load
    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    return { session, loading, endSession };
}
