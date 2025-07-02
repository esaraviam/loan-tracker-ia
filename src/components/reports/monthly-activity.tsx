"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useEffect, useState } from "react"
import { format } from "date-fns"

interface MonthlyActivityProps {
  userId: string
}

interface ActivityData {
  month: string
  loans: number
  returns: number
}

export function MonthlyActivity({ userId }: MonthlyActivityProps) {
  const [data, setData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/reports/monthly-activity?userId=${userId}`)
        const result = await response.json()
        setData(result.data || [])
      } catch (error) {
        console.error("Failed to fetch monthly activity:", error)
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
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Loans created and returned by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
        <CardDescription>Loans created and returned by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => format(new Date(value), "MMM")}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              labelFormatter={(value) => format(new Date(value as string), "MMMM yyyy")}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Bar 
              dataKey="loans" 
              fill="hsl(var(--primary))" 
              name="New Loans"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="returns" 
              fill="#10b981" 
              name="Returns"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}