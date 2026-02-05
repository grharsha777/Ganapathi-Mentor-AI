'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  is_read: boolean
  created_at: string
}

export function AlertsList({
  alerts,
  teamId,
}: {
  alerts: Alert[]
  teamId: string
}) {
  const [localAlerts, setLocalAlerts] = useState(alerts)

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, is_read: true }),
      })

      setLocalAlerts(
        localAlerts.map((alert) =>
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
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>
          {localAlerts.filter((a) => !a.is_read).length} unread
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {localAlerts.length > 0 ? (
            localAlerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border flex items-start justify-between',
                  alert.is_read
                    ? 'bg-muted border-muted'
                    : 'bg-card border-border'
                )}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.title}</p>
                    {alert.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!alert.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="ml-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No alerts yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
