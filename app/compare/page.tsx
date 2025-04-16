import Link from "next/link"
import { notFound } from "next/navigation"
import { getPlayersByIds, getPlayersGarData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { ComparisonChart } from "@/components/comparison-chart"
import { ComparisonTable } from "@/components/comparison-table"

export const dynamic = "force-dynamic"

interface ComparePageProps {
  searchParams: {
    ids?: string
  }
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids } = searchParams

  if (!ids) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Players
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Player Comparison</CardTitle>
            <CardDescription>Select players from the main page to compare them</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No players selected for comparison.</p>
            <Button asChild className="mt-4">
              <Link href="/">Select Players</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const playerIds = ids.split(",").map((id) => Number.parseInt(id))

  if (playerIds.some((id) => isNaN(id))) {
    notFound()
  }

  console.log("[Server] Fetching players for comparison with IDs:", playerIds)
  const players = await getPlayersByIds(playerIds)

  if (players.length === 0) {
    notFound()
  }

  console.log("[Server] Fetching GAR data for comparison")
  const garData = await getPlayersGarData(playerIds)

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
            <CardTitle>Player Comparison</CardTitle>
            <CardDescription>Comparing {players.length} players</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {players.map((player) => (
                <div key={player.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{player.name}</h3>
                    <Badge>{player.position}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {player.team} | {player.age} years old
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Projected AAV:</span>
                      <span className="font-medium">${player.projectedAav.toLocaleString()}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Projected Term:</span>
                      <span className="font-medium">{player.projectedTerm} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Value Tier:</span>
                      <span className="font-medium">{player.valueTier}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ComparisonTable players={players} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GAR Comparison</CardTitle>
            <CardDescription>3-Year Goals Above Replacement Trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ComparisonChart data={garData} players={players} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Value Analysis</CardTitle>
            <CardDescription>Comparing age, term, and projected value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Age vs. Projected AAV</h3>
                <ComparisonChart
                  data={players.map((p) => ({ name: p.name, x: p.age, y: p.projectedAav }))}
                  players={players}
                  xLabel="Age"
                  yLabel="AAV ($M)"
                  type="scatter"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Term vs. Production</h3>
                <ComparisonChart
                  data={players.map((p) => ({ name: p.name, x: p.projectedTerm, y: p.recentProduction }))}
                  players={players}
                  xLabel="Contract Length (Years)"
                  yLabel="Recent Production"
                  type="scatter"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
