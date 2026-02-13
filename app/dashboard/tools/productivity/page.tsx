import { Suspense } from 'react';
import ProductivityHub from '@/components/tools/productivity-hub';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { CheckSquare } from 'lucide-react';

export const metadata = {
    title: 'Productivity | Neural Code Symbiosis',
    description: 'AI task prioritization and meeting agenda automation.',
};

export default function ProductivityPage() {
    return (
        <PageShell>
            <PageHeader
                title="Productivity Workflow Engine"
                description="Optimize your day with AI-driven task ranking and agenda building."
                icon={CheckSquare}
            />

            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
                <ProductivityHub />
            </Suspense>
        </PageShell>
    );
}
