import { NextResponse } from "next/server"
import { getPlayers } from "@/lib/data"

export async function GET() {
  try {
    console.log("Database connection test API called")

    // Log environment variables (redacted for security)
    const dbUrl = process.env.DATABASE_URL || "No DATABASE_URL found"
    const redactedUrl = dbUrl.replace(/:([^@]*)@/, ":****@")
    console.log(`DATABASE_URL: ${redactedUrl}`)

    // Try to get players
    const players = await getPlayers()

    // Return success with player count
    return NextResponse.json({
      success: true,
      message: "Database connection test",
      playerCount: players.length,
      usingMockData: players.length === 10 && players[0].name === "Connor McDavid",
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Database test API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
