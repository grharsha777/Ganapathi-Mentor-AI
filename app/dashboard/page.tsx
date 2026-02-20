import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import PersonalDashboard from '@/components/dashboard/personal-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Dashboard | Neural Code Symbiosis',
  description: 'Your personal AI mentor dashboard.',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let userData = null;
  if (token) {
    const decoded = await verifyToken(token) as any;
    if (decoded?.userId) {
      await connectToDatabase();
      const userDoc = await User.findById(decoded.userId).lean() as any;
      if (userDoc) {
        userData = {
          full_name: userDoc.full_name,
          metrics: userDoc.metrics || { current_streak: 0 }
        };
      }
    }
  }

  const firstName = userData?.full_name ? userData.full_name.split(' ')[0] : 'User';
  const streak = userData?.metrics?.current_streak || 0;

  return (
    <PageShell>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`You're on a ${streak}-day streak! Keep expanding your neural network.`}
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
