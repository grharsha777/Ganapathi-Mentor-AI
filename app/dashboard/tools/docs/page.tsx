import { Suspense } from 'react';
import DocGenerator from '@/components/tools/doc-generator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileText } from 'lucide-react';

export const metadata = {
    title: 'AI Doc Generator | Neural Code Symbiosis',
    description: 'Auto-generate READMEs, API docs, and architecture diagrams.',
};

export default function DocsPage() {
    return (
        <PageShell>
            <PageHeader
                title="AI Documentation Generator"
                description="Turn code into professional documentation, diagrams, and specs instantly."
                icon={FileText}
            />

            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
                <DocGenerator />
            </Suspense>
        </PageShell>
    );
}
