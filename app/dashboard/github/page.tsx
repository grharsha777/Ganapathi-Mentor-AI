import { Suspense } from 'react';
import GitHubDashboard from '@/components/dashboard/github-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Github } from 'lucide-react';

export const metadata = {
    title: 'GitHub Analytics | Ganapathi Mentor AI',
    description: 'View your GitHub repository analytics and contribution stats.',
};

export default function GitHubPage() {
    return (
        <PageShell>
            <PageHeader
                title="GitHub Analytics"
                description="View your repositories, contribution stats, and coding activity."
                icon={Github}
            />

            <Suspense fallback={
                <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            }>
                <GitHubDashboard />
            </Suspense>
        </PageShell>
    );
}
