// components/gar-chart.tsx
"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { GarData } from "@/lib/types"

interface GarChartProps {
  data: GarData[]
  projectedGar2526?: number
}

export function GarChart({ data, projectedGar2526 }: GarChartProps) {
  console.log("[Client] GarChart rendering with data points:", data.length)
  console.log("[Client] Projected GAR 2025-26:", projectedGar2526)

  // Create a copy of the data to avoid mutating the original
  const chartData = [...data]

  // Add projected GAR data point if available
  if (projectedGar2526 !== undefined) {
    chartData.push({
      playerId: data[0]?.playerId || 0,
      season: "2025-26 (Projected)",
      gar: projectedGar2526,
    })
  }

  return (
    <ChartContainer
      config={{
        gar: {
          label: "Goals Above Replacement",
          color: "hsl(var(--chart-1))",
        },
        projectedGar: {
          label: "Projected GAR",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            dot={(props) => {
              // Use different styling for projected points
              const isProjected = props.payload && props.payload.season === "2025-26 (Projected)"
              if (isProjected) {
                return (
                  <svg
                    x={props.cx - 6}
                    y={props.cy - 6}
                    width={12}
                    height={12}
                    fill="var(--color-projectedGar)"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17l-6 4v-8.5l6-3.5 6 3.5v8.5z" />
                  </svg>
                )
              }
              return <circle cx={props.cx} cy={props.cy} r={5} fill="var(--color-gar)" />
            }}
            activeDot={{ r: 7 }}
            name={(entry) => (entry.season === "2025-26 (Projected)" ? "projectedGar" : "gar")}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
