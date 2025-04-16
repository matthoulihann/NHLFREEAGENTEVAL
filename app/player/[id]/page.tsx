import Link from "next/link"
import { notFound } from "next/navigation"
import { getPlayerById, getPlayerGarData, getPlayerStats } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { GarChart } from "@/components/gar-chart"
import { PlayerStatsTable } from "@/components/player-stats-table"

export const dynamic = "force-dynamic"

interface PlayerPageProps {
  params: {
    id: string
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  console.log("[Server] Rendering player page for ID:", params.id)

  const playerId = Number.parseInt(params.id)

  if (isNaN(playerId)) {
    notFound()
  }

  console.log("[Server] Fetching player data for ID:", playerId)
  const player = await getPlayerById(playerId)

  if (!player) {
    notFound()
  }

  console.log("[Server] Fetching GAR data for player ID:", playerId)
  const garData = await getPlayerGarData(playerId)

  console.log("[Server] Fetching stats for player ID:", playerId)
  const playerStats = await getPlayerStats(playerId)
  console.log("[Server] Stats fetched:", playerStats.length, "seasons")

  const getValueTierBadge = (valueTier: string) => {
    switch (valueTier) {
      case "Bargain":
        return <Badge className="bg-green-500 hover:bg-green-600">Bargain</Badge>
      case "Fair Deal":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Fair Deal</Badge>
      case "Overpay":
        return <Badge className="bg-red-500 hover:bg-red-600">Overpay</Badge>
      default:
        return <Badge>{valueTier}</Badge>
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/" className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Players
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">{player.name}</CardTitle>
            <CardDescription>
              {player.position} | {player.team} | {player.age} years old
            </CardDescription>
            <div className="mt-2">{getValueTierBadge(player.valueTier)}</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contract Status</h3>
                <p className="text-lg font-semibold">2025 {player.contractType}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Projected Contract</h3>
                <p className="text-lg font-semibold">
                  ${player.projectedAav.toLocaleString()}M × {player.projectedTerm} years
                </p>
              </div>

              {/* Add Projected GAR 2025-26 Section if available */}
              {player.projectedGar2526 !== undefined && (
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Projected GAR 2025-26
                  </h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {player.projectedGar2526.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Goals Above Replacement</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Value Assessment</h3>
                <p className="mt-1">{player.valueAssessment}</p>
              </div>

              <div className="pt-4">
                <Button asChild>
                  <Link href={`/compare?ids=${player.id}`}>Compare Player</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>3-Year GAR Trend</CardTitle>
            <CardDescription>Goals Above Replacement measures a player's total contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <GarChart data={garData} projectedGar2526={player.projectedGar2526} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
            <CardDescription>Last 3 seasons performance data</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pass the pre-fetched stats to the component */}
            <PlayerStatsTable stats={playerStats} position={player.position} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
