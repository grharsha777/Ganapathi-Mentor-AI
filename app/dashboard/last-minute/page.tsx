import { LastMinutePanel } from '@/components/last-minute/last-minute-panel'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Zap } from 'lucide-react';

export default function LastMinutePage() {
    return (
        <PageShell>
            <PageHeader
                title="Last Minute Prep"
                description="Quick revision and emergency preparation tools."
                icon={Zap}
            />
            <LastMinutePanel />
        </PageShell>
    )
}
