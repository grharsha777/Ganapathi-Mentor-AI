import { Suspense } from 'react';
import GitHubDashboard from '@/components/dashboard/github-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Github } from 'lucide-react';

export const metadata = {
    title: 'Developer Gravity Hub | Ganapathi Mentor AI',
    description: 'Your gamified GitHub journey with XP, quests, AI coaching, and deep analytics.',
};

export default function GitHubPage() {
    return (
        <PageShell>
            <PageHeader
                title="Developer Gravity Hub"
                description="Your gamified coding journey — earn XP, complete quests, and level up with AI coaching."
                icon={Github}
            />

            <Suspense fallback={
                <div className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-36 rounded-2xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            }>
                <GitHubDashboard />
            </Suspense>
        </PageShell>
    );
}

