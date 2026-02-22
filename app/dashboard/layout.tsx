import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardDock } from '@/components/dashboard/dock'
import { OnboardingTutorial } from '@/components/onboarding/onboarding-tutorial'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/auth/login')
  }

  const user = await verifyToken(token) as any

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <DashboardNav user={user} />
      <main className="flex-1 overflow-y-auto pb-6 sm:pb-8 lg:pb-32 xl:pb-44 flex flex-col items-center overscroll-y-contain">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:max-w-[1600px] 2xl:mx-auto">
          {children}
        </div>
      </main>
      <DashboardDock />
      <OnboardingTutorial />
    </div>
  )
}
