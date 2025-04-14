"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { GarData } from "@/lib/types"

interface GarChartProps {
  data: GarData[]
}

export function GarChart({ data }: GarChartProps) {
  return (
    <ChartContainer
      config={{
        gar: {
          label: "Goals Above Replacement",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="season" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ReferenceLine y={0} stroke="#888" />
          <Line
            type="monotone"
            dataKey="gar"
            stroke="var(--color-gar)"
            strokeWidth={2}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
