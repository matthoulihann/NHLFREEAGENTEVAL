import { getPlayers } from "@/lib/data"
import { PlayerTable } from "@/components/player-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const players = await getPlayers()

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">NHL Free Agent Evaluation</CardTitle>
          <CardDescription>Analyze and compare projected contracts for NHL free agents</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This tool helps evaluate NHL free agents based on their projected contracts and performance metrics. Compare
            players, view detailed stats, and assess contract value.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Free Agent Players</CardTitle>
          <CardDescription>Select players to view details or compare multiple players</CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable initialPlayers={players} />
        </CardContent>
      </Card>
    </main>
  )
}
