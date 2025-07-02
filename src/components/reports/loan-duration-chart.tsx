"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useEffect, useState } from "react"

interface LoanDurationChartProps {
  userId: string
}

interface DurationData {
  name: string
  value: number
  color: string
}

const COLORS = {
  "< 7 days": "#10b981",
  "7-30 days": "#3b82f6",
  "1-3 months": "#f59e0b",
  "> 3 months": "#ef4444",
}

export function LoanDurationChart({ userId }: LoanDurationChartProps) {
  const [data, setData] = useState<DurationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/reports/loan-duration?userId=${userId}`)
        const result = await response.json()
        
        const chartData = Object.entries(result.durations || {}).map(([range, count]) => ({
          name: range,
          value: count as number,
          color: COLORS[range as keyof typeof COLORS] || "#000",
        }))

        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch duration data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Duration Distribution</CardTitle>
          <CardDescription>How long items are typically loaned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Duration Distribution</CardTitle>
          <CardDescription>How long items are typically loaned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No duration data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Duration Distribution</CardTitle>
        <CardDescription>How long items are typically loaned</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}