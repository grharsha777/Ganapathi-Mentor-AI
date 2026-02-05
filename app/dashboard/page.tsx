'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricsChart } from '@/components/dashboard/metrics-chart'
import { AlertsList } from '@/components/dashboard/alerts-list'
import { TeamSelector } from '@/components/dashboard/team-selector'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedTeam) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [metricsRes, alertsRes] = await Promise.all([
          fetch(`/api/metrics?teamId=${selectedTeam}`),
          fetch(`/api/alerts?teamId=${selectedTeam}`),
        ])

        if (metricsRes.ok) {
          setMetrics(await metricsRes.json())
        }
        if (alertsRes.ok) {
          setAlerts(await alertsRes.json())
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Poll for new data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [selectedTeam])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your team's metrics and performance
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Metric
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Select Team</h2>
        <TeamSelector
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
        />
      </div>

      {selectedTeam && !loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Key Metrics Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics
                  .filter((m) => m.category === 'performance')
                  .reduce((sum, m) => sum + m.value, 0)
                  .toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>This period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                $
                {metrics
                  .filter((m) => m.category === 'revenue')
                  .reduce((sum, m) => sum + m.value, 0)
                  .toFixed(0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement</CardTitle>
              <CardDescription>User interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics
                  .filter((m) => m.category === 'engagement')
                  .reduce((sum, m) => sum + m.value, 0)
                  .toFixed(0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTeam && !loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MetricsChart metrics={metrics} />
          </div>
          <div>
            <AlertsList alerts={alerts} teamId={selectedTeam} />
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      )}

      {!selectedTeam && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            Please select a team to view metrics
          </div>
        </div>
      )}
    </div>
  )
}
