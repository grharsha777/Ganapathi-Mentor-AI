'use client'

export interface DemoMetric {
    id: string
    name: string
    value: number
    change: number
    trend: 'up' | 'down' | 'neutral'
    history: { date: string; value: number }[]
}

export interface DemoAlert {
    id: string
    title: string
    severity: 'info' | 'warning' | 'critical'
    timestamp: string
    message: string
}

export interface DemoMember {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
}

export const getDemoData = () => {
    if (typeof window === 'undefined') return null

    const metrics = localStorage.getItem('demo_metrics')
    const alerts = localStorage.getItem('demo_alerts')
    const team = localStorage.getItem('demo_team')

    return {
        metrics: metrics ? JSON.parse(metrics) : defaultMetrics,
        alerts: alerts ? JSON.parse(alerts) : defaultAlerts,
        team: team ? JSON.parse(team) : defaultTeam,
    }
}

export const saveDemoData = (type: 'metrics' | 'alerts' | 'team', data: any) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(`demo_${type}`, JSON.stringify(data))
}

const defaultMetrics: DemoMetric[] = [
    {
        id: 'm1',
        name: 'Daily Active Users',
        value: 1240,
        change: 12.5,
        trend: 'up',
        history: [
            { date: '2024-05-01', value: 1100 },
            { date: '2024-05-02', value: 1150 },
            { date: '2024-05-03', value: 1240 },
        ]
    },
    {
        id: 'm2',
        name: 'API Error Rate',
        value: 0.05,
        change: -2.1,
        trend: 'down',
        history: [
            { date: '2024-05-01', value: 0.08 },
            { date: '2024-05-02', value: 0.06 },
            { date: '2024-05-03', value: 0.05 },
        ]
    }
]

const defaultAlerts: DemoAlert[] = [
    {
        id: 'a1',
        title: 'High Latency Detected',
        severity: 'warning',
        timestamp: new Date().toISOString(),
        message: 'Average response time increased by 300ms in Asia region.'
    },
    {
        id: 'a2',
        title: 'Database Spike',
        severity: 'critical',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        message: 'CPU usage exceeded 90% on primary database node.'
    }
]

const defaultTeam: DemoMember[] = [
    { id: 'u1', name: 'Demo User', email: 'demo@example.com', role: 'Admin' },
    { id: 'u2', name: 'Harsha', email: 'harsha@example.com', role: 'Developer' }
]
