import { Suspense } from 'react';
import TeamCollaboration from '@/components/collaboration/team-collab';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Share2 } from 'lucide-react';

export const metadata = {
    title: 'Team Collaboration | Neural Code Symbiosis',
    description: 'AI-driven team intelligence and silo detection.',
};

export default function CollabPage() {
    return (
        <PageShell>
            <PageHeader
                title="Collaboration Intelligence"
                description="Break down silos and share knowledge automatically."
                icon={Share2}
            />

            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
                <TeamCollaboration />
            </Suspense>
        </PageShell>
    );
}
