import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardDock } from '@/components/dashboard/dock'
import { OnboardingTutorial } from '@/components/onboarding/onboarding-tutorial'
import { QuotaBanner } from '@/components/dashboard/QuotaBanner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    console.error('DashboardLayout: No token found in cookies');
    redirect('/auth/login?error=no_token')
  }

  let user: any = null;
  try {
    user = await verifyToken(token)
  } catch (err: any) {
    console.error('DashboardLayout: verifyToken threw an error:', err);
    redirect('/auth/login?error=verify_error')
  }

  if (!user) {
    console.error('DashboardLayout: verifyToken returned null');
    redirect('/auth/login?error=invalid_user')
  }

  // Normalize the user id — JWT may use `id` or `userId`
  const normalizedUser = {
    ...user,
    id: (user.id ?? user.userId ?? '').toString(),
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden w-full text-foreground">
      {/* Enterprise Cinematic Dashboard Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <QuotaBanner />
        <DashboardNav user={normalizedUser} />
      <main className="flex-1 overflow-y-auto w-full flex flex-col items-center overscroll-y-contain pb-32 sm:pb-40 lg:pb-52 relative">
        <div className="w-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0 relative">
          {children}
        </div>
      </main>
      <DashboardDock />
      <OnboardingTutorial />
      </div>
    </div>
  )
}
