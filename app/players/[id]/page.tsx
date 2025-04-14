export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { getPlayerById, getPlayerGarData, getPlayerStats } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Award } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { PlayerGarChart } from "@/components/player-gar-chart"
import { PlayerStatsTable } from "@/components/player-stats-table"

interface PlayerPageProps {
  params: {
    id: string
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  const player = await getPlayerById(id)

  if (!player) {
    notFound()
  }

  const garData = await getPlayerGarData(id)
  const stats = await getPlayerStats(id)

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/" className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Players
        </Link>
      </Button>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-3xl">{player.name}</CardTitle>
                  <Badge className="ml-2">{player.position}</Badge>
                  <Badge variant="outline">{player.contractType}</Badge>
                </div>
                <CardDescription className="mt-1">
                  {player.team} | {player.age} years old
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/compare?ids=${player.id}`}>Compare Player</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard
                title="Projected Contract"
                value={`$${player.projectedAav.toLocaleString()}M × ${player.projectedTerm} years`}
                description="Average Annual Value & Term"
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatCard
                title="Value Assessment"
                value={player.valueTier}
                description={player.valueAssessment}
                icon={<Award className="h-4 w-4" />}
              />
              <StatCard
                title="Recent Production"
                value={player.position === "G" ? `${player.savePercentage} SV%` : `${player.recentProduction} Points`}
                description={
                  player.position === "G"
                    ? `${player.goalsAgainstAverage} GAA`
                    : `${player.pointsPerGame} Points Per Game`
                }
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>3-Year GAR Trend</CardTitle>
                <CardDescription>Goals Above Replacement measures a player's total contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <PlayerGarChart data={garData} />
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
            <CardDescription>3-Year Performance Data</CardDescription>
          </CardHeader>
          <CardContent>
            <PlayerStatsTable stats={stats} position={player.position} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
