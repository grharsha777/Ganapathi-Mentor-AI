'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import {
  Activity, AlertTriangle, Users, Settings, Plus,
  TrendingUp, TrendingDown, Bell, LogOut, Home
} from 'lucide-react'
import { getDemoData, saveDemoData, DemoMetric, DemoAlert, DemoMember } from '@/lib/demo-store'

export default function DemoDashboard() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<{
    metrics: DemoMetric[]
    alerts: DemoAlert[]
    team: DemoMember[]
  } | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    let demoUser = localStorage.getItem('demo_user')
    if (!demoUser) {
      const defaultUser = {
        id: 'demo-123',
        email: 'demo@example.com',
        full_name: 'Demo User',
        role: 'user'
      }
      localStorage.setItem('demo_user', JSON.stringify(defaultUser))
      localStorage.setItem('demo_session', 'demo-session-token')
      demoUser = JSON.stringify(defaultUser)
    }
    setUser(JSON.parse(demoUser))
    setData(getDemoData())
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('demo_user')
    localStorage.removeItem('demo_session')
    window.location.href = '/auth/login'
  }

  const addMetric = () => {
    if (!data) return
    const newMetric: DemoMetric = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Custom Metric',
      value: Math.floor(Math.random() * 1000),
      change: Math.random() * 20 - 10,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      history: Array.from({ length: 7 }, (_, i) => ({
        date: `2024-05-0${i + 1}`,
        value: Math.floor(Math.random() * 1000)
      }))
    }
    const updated = [...data.metrics, newMetric]
    setData({ ...data, metrics: updated })
    saveDemoData('metrics', updated)
  }

  const resolveAlert = (id: string) => {
    if (!data) return
    const updated = data.alerts.filter(a => a.id !== id)
    setData({ ...data, alerts: updated })
    saveDemoData('alerts', updated)
  }

  if (!user || !data) return <div className="p-8">Loading Demo Mode...</div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden md:block">Analytics Pro</span>
              <Badge variant="secondary" className="ml-2 font-mono">DEMO</Badge>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Demo Mode Active</h3>
            <p className="text-sm text-primary/80">
              Explore Analytics Pro features with mock data. All changes are stored locally in your browser and will persist across refreshes.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-card border">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2">
                <TrendingUp className="w-4 h-4" /> Metrics
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <AlertTriangle className="w-4 h-4" /> Alerts
                {data.alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {data.alerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="w-4 h-4" /> Team
              </TabsTrigger>
            </TabsList>

            {activeTab === 'metrics' && (
              <Button onClick={addMetric} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Metric
              </Button>
            )}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.metrics.map(metric => (
                <Card key={metric.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.name.includes('Rate') ? `${(metric.value * 100).toFixed(2)}%` : metric.value.toLocaleString()}
                    </div>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Visualizing performance over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.metrics[0].history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid gap-4">
              {data.metrics.map(metric => (
                <Card key={metric.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                      <h4 className="font-bold text-lg mb-1">{metric.name}</h4>
                      <p className="text-sm text-muted-foreground">Detailed tracking for {metric.name.toLowerCase()}</p>
                      <div className="mt-4 flex gap-8">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Current</p>
                          <p className="text-xl font-bold">{metric.value}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Growth</p>
                          <p className={`text-xl font-bold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-64 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metric.history}>
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {data.alerts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No active alerts. Your system is healthy.</p>
              </div>
            ) : (
              data.alerts.map(alert => (
                <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-destructive' :
                    alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                  }`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </CardHeader>
                  <CardContent className="flex justify-between items-end">
                    <p className="text-sm text-muted-foreground max-w-2xl">{alert.message}</p>
                    <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>Resolve</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage your workspace members and their roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.team.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  ))}
                  <div className="pt-4 border-t flex gap-4">
                    <Input placeholder="Invite by email..." className="max-w-xs" />
                    <Button variant="secondary">Invite</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 flex justify-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Landing Page
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
