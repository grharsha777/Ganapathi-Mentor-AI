import { ResearchHub } from '@/components/research/research-hub'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Microscope } from 'lucide-react';

export default function ResearchPage() {
    return (
        <PageShell>
            <PageHeader
                title="Research Hub"
                description="Deep dive into technical topics with AI-assisted research."
                icon={Microscope}
            />
            <ResearchHub />
        </PageShell>
    )
}
