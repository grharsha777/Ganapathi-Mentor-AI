import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardDock } from '@/components/dashboard/dock'

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
    <div className="flex flex-col h-screen bg-background relative">
      <DashboardNav user={user} />
      <main className="flex-1 overflow-y-auto pb-44 flex flex-col items-center">
        <div className="w-full px-4 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <DashboardDock />
    </div>
  )
}
