"use client"

import {
  Line,
  LineChart,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { GarData, Player } from "@/lib/types"

interface ComparisonChartProps {
  data: GarData[] | any[]
  players: Player[]
  xLabel?: string
  yLabel?: string
  type?: "line" | "scatter"
}

export function ComparisonChart({
  data,
  players,
  xLabel = "Season",
  yLabel = "GAR",
  type = "line",
}: ComparisonChartProps) {
  // Create a config object for the chart container
  const chartConfig: Record<string, { label: string; color: string }> = {}

  // Add each player to the config
  players.forEach((player, index) => {
    const colorIndex = (index % 10) + 1 // Use modulo to cycle through available chart colors
    chartConfig[player.id.toString()] = {
      label: player.name,
      color: `hsl(var(--chart-${colorIndex}))`,
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="season"
              type="category"
              allowDuplicatedCategory={false}
              label={{ value: xLabel, position: "insideBottomRight", offset: -10 }}
            />
            <YAxis label={{ value: yLabel, angle: -90, position: "insideLeft" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />

            {players.map((player) => (
              <Line
                key={player.id}
                dataKey="gar"
                data={data.filter((d) => d.playerId === player.id)}
                name={player.name}
                stroke={`var(--color-${player.id})`}
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        ) : (
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              name={xLabel}
              label={{ value: xLabel, position: "insideBottomRight", offset: -10 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              name={yLabel}
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />

            {players.map((player) => (
              <Scatter
                key={player.id}
                name={player.name}
                data={data.filter((d) => d.name === player.name)}
                fill={`var(--color-${player.id})`}
              />
            ))}
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  )
}
