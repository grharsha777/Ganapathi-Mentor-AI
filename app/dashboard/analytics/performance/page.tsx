import { Suspense } from 'react';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { BarChart3 } from 'lucide-react';

export const metadata = {
    title: 'Learning Analytics | Neural Code Symbiosis',
    description: 'Track ROI, skill growth, and team performance.',
};

export default function AnalyticsPage() {
    return (
        <PageShell>
            <PageHeader
                title="Performance Analytics"
                description="Quantify the impact of learning on team shipping velocity."
                icon={BarChart3}
            />

            <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
                <AnalyticsDashboard />
            </Suspense>
        </PageShell>
    );
}
