import { Suspense } from 'react';
import RoadmapView from '@/components/learning/roadmap-view';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Map } from 'lucide-react';

export const metadata = {
    title: 'AI Learning Path | Neural Code Symbiosis',
    description: 'Personalized AI-generated learning roadmaps for developers.',
};

export default function LearningPage() {
    return (
        <PageShell>
            <PageHeader
                title="Your Neural Learning Path"
                description="AI-driven skill analysis and personalized roadmap generation."
                icon={Map}
            />

            <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-xl" />}>
                <RoadmapView />
            </Suspense>
        </PageShell>
    );
}
