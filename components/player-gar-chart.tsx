"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import type { GarData } from "@/lib/types"

interface PlayerGarChartProps {
  data: GarData[]
}

export function PlayerGarChart({ data }: PlayerGarChartProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-6 h-[300px] flex items-center justify-center">
          <p>Loading chart...</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    season: item.season,
    gar: item.gar,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="season" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)} GAR`, "Goals Above Replacement"]}
            labelFormatter={(label) => `Season: ${label}`}
          />
          <Line type="monotone" dataKey="gar" stroke="#2563eb" strokeWidth={2} dot={{ r: 6 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
