'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Plus } from 'lucide-react'
import { TeamSelector } from '@/components/dashboard/team-selector'
import { PageShell } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  is_read: boolean
  created_at: string
}

export default function AlertsPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [newAlert, setNewAlert] = useState({ title: '', severity: 'info' })

  useEffect(() => {
    if (!selectedTeam) return

    const fetchAlerts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/alerts?teamId=${selectedTeam}`)
        if (res.ok) {
          setAlerts(await res.json())
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()

    const interval = setInterval(fetchAlerts, 20000)
    return () => clearInterval(interval)
  }, [selectedTeam])

  const handleCreateAlert = async () => {
    if (!newAlert.title.trim() || !selectedTeam) return

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: selectedTeam,
          title: newAlert.title,
          severity: newAlert.severity,
        }),
      })

      if (res.ok) {
        const alert = await res.json()
        setAlerts([alert, ...alerts])
        setNewAlert({ title: '', severity: 'info' })
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, is_read: true }),
      })

      setAlerts(
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      )
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Alerts"
        description="Manage system alerts and notifications"
        icon={AlertCircle}
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Alert</DialogTitle>
                <DialogDescription>
                  Add a new alert to notify your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Alert title"
                  value={newAlert.title}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, title: e.target.value })
                  }
                />
                <Select
                  value={newAlert.severity}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleCreateAlert}
                  disabled={!newAlert.title.trim()}
                  className="w-full"
                >
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Section title="Select Team">
        <TeamSelector
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
        />
      </Section>

      {selectedTeam && !loading && (
        <Section title="Alert Summary" description={`${alerts.filter((a) => !a.is_read).length} unread alerts`}>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  alert.is_read ? 'opacity-60' : ''
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        {alert.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {alerts.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  No alerts yet
                </div>
              </CardContent>
            </Card>
          )}
        </Section>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading alerts...</div>
        </div>
      )}

      {!selectedTeam && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            Please select a team to view alerts
          </div>
        </div>
      )}
    </PageShell>
  )
}
