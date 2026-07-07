import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import PersonalDashboard from '@/components/dashboard/personal-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import mongoose from 'mongoose';

export const metadata = {
  title: 'Dashboard | Ganapathi Mentor AI',
  description: 'Your personal AI mentor command center.',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let userData = null;
  if (token) {
    try {
      const decoded = await verifyToken(token) as any;
      // decoded.id or decoded.userId — normalize it
      const userId = decoded?.id ?? decoded?.userId;

      if (userId && mongoose.isValidObjectId(userId)) {
        await connectToDatabase();
        const userDoc = await User.findById(userId).lean() as any;
        if (userDoc) {
          userData = {
            full_name: userDoc.full_name ?? null,
            metrics: userDoc.metrics ?? { current_streak: 0 }
          };
        }
      } else if (decoded?.email) {
        // Fallback: find user by email (handles legacy UUID-based id tokens)
        await connectToDatabase();
        const userDoc = await User.findOne({ email: decoded.email }).lean() as any;
        if (userDoc) {
          userData = {
            full_name: userDoc.full_name ?? null,
            metrics: userDoc.metrics ?? { current_streak: 0 }
          };
        }
      }
    } catch {
      // Silently fail — dashboard renders without user-specific data
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col bg-black text-white min-h-screen relative pb-8">
      <Suspense fallback={
        <div className="space-y-6 w-full animate-pulse">
          <div className="h-[300px] rounded-3xl bg-white/[0.03]" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        </div>
      }>
        <PersonalDashboard />
      </Suspense>
    </div>
  );
}
