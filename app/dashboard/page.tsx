import { Suspense } from 'react';
import PersonalDashboard from '@/components/dashboard/personal-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Dashboard | Neural Code Symbiosis',
  description: 'Your personal AI mentor dashboard.',
};

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHeader
        title="Welcome back, Harsha"
        description="You're on a 12-day streak! Keep expanding your neural network."
        actions={
          <div className="hidden md:block text-right bg-card/50 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Level</p>
            <p className="text-2xl font-black text-primary drop-shadow-md">Senior Architect I</p>
          </div>
        }
      />

      <Suspense fallback={<Skeleton className="w-full h-[800px] rounded-3xl" />}>
        <PersonalDashboard />
      </Suspense>
    </PageShell>
  );
}
