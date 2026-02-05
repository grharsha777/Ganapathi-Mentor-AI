'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Metric {
  id: string
  name: string
  value: number
  category: string
  timestamp: string
}

export function MetricsChart({ metrics }: { metrics: Metric[] }) {
  // Group metrics by timestamp for the chart
  const chartData = metrics
    .reduce(
      (acc, metric) => {
        const existing = acc.find(
          (item) =>
            new Date(item.timestamp).toLocaleDateString() ===
            new Date(metric.timestamp).toLocaleDateString()
        )

        if (existing) {
          existing[metric.name] = metric.value
        } else {
          acc.push({
            timestamp: new Date(metric.timestamp).toLocaleDateString(),
            [metric.name]: metric.value,
          })
        }

        return acc
      },
      [] as any[]
    )
    .slice(0, 30) // Show last 30 days

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
  const uniqueMetrics = [...new Set(metrics.map((m) => m.name))]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Over Time</CardTitle>
        <CardDescription>
          Historical performance data and trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              {uniqueMetrics.slice(0, 5).map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={colors[index % colors.length]}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-72 text-muted-foreground">
            No metrics data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
