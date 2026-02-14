'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ProtectedPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in (demo mode)
    const demoUser = localStorage.getItem('demo_user')
    setTimeout(() => {
      if (demoUser) {
        setUser(JSON.parse(demoUser))
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Not logged in, redirect to login
        router.push('/auth/login')
      }
      setLoading(false)
    }, 0)
  }, [router])

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Protected Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Redirecting to dashboard...</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
