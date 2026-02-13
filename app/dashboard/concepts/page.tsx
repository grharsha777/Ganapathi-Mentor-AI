import { Suspense } from 'react';
import ConceptExplainer from '@/components/learning/concept-explainer';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { BrainCircuit } from 'lucide-react';

export const metadata = {
    title: 'Concept Engine | Neural Code Symbiosis',
    description: 'Master any technical concept at 3 distinct levels.',
};

export default function ConceptPage() {
    return (
        <PageShell>
            <PageHeader
                title="Concept Explanation Engine"
                description="Adaptive learning: Beginner, Intermediate, and Advanced deep dives."
                icon={BrainCircuit}
            />

            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
                <ConceptExplainer />
            </Suspense>
        </PageShell>
    );
}
