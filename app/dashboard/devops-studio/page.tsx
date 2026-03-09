import { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Server } from 'lucide-react';
import DevOpsStudio from '@/components/tools/devops-studio';

export const metadata: Metadata = {
    title: 'Ganapathi DevOps Studio | AI Inspector',
    description: 'AI-powered Docker and Kubernetes validation and auto-fixing suite.',
};

export default function DevOpsPage() {
    return (
        <PageShell>
            <PageHeader
                title="AI DevOps Studio"
                description="Instant security analysis and auto-fixing for your Docker and Kubernetes configurations."
                icon={Server}
            />

            <div className="mt-8">
                <DevOpsStudio />
            </div>
        </PageShell>
    );
}
