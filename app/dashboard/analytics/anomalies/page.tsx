import { Suspense } from 'react';
import AnomalyDetector from '@/components/analytics/anomaly-detector';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
    title: 'Anomaly Detection | Neural Code Symbiosis',
    description: 'Real-time alerts on team learning velocity and bottlenecks.',
};

export default function AnomalyPage() {
    return (
        <PageShell>
            <PageHeader
                title="Neural Anomaly Detection"
                description="Real-time monitoring of team knowledge health and productivity risks."
                icon={AlertTriangle}
            />

            <Suspense fallback={<Skeleton className="w-full h-[400px]" />}>
                <AnomalyDetector />
            </Suspense>
        </PageShell>
    );
}
