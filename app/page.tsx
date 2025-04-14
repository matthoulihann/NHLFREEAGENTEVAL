export const dynamic = "force-dynamic"

import Link from "next/link"
import { getPlayers } from "@/lib/data"
import { PlayerTable } from "@/components/player-table"
import { JoystickIcon as HockeyStick } from "lucide-react"
import { DbConnectionTest } from "@/components/db-connection-test"
import { DbTestUI } from "@/components/db-test-ui"

export default async function Home() {
  const players = await getPlayers()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <HockeyStick className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Hockey Contract Tracker</h1>
        </div>
        <p className="text-xl text-muted-foreground">2025 UFAs & RFAs Analysis</p>
      </div>

      <div className="mb-6">
        <DbTestUI />
      </div>

      <div className="mb-6">
        <DbConnectionTest />
      </div>

      <div className="mb-6 bg-muted/40 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Player Contract Database</h2>
        <p className="mb-4">
          Browse through our comprehensive database of upcoming 2025 free agents. Sort and filter by various metrics to
          find the perfect fit for your team's needs.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/compare"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
          >
            Compare Players
          </Link>
        </div>
      </div>

      <PlayerTable initialPlayers={players} />
    </main>
  )
}
