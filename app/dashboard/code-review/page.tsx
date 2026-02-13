import { Suspense } from 'react';
import CodeReviewPanel from '@/components/learning/code-review-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Code2 } from 'lucide-react';

export const metadata = {
    title: 'AI Code Review | Neural Code Symbiosis',
    description: 'Smart code analysis and learning assistant.',
};

export default function CodeReviewPage() {
    return (
        <PageShell>
            <PageHeader
                title="Smart Code Review"
                description="Analyze code patterns, detect complexity, and auto-generate docs."
                icon={Code2}
            />

            <Suspense fallback={<Skeleton className="w-full h-full" />}>
                <CodeReviewPanel />
            </Suspense>
        </PageShell>
    );
}
