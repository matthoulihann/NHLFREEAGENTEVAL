import { NextResponse } from "next/server"
import { getPlayers } from "@/lib/data"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    console.log("Database connection test API called")

    // Test database connection
    const isConnected = await testConnection()

    // Try to get players
    const players = await getPlayers()

    // Return success with player count
    return NextResponse.json({
      success: true,
      message: "Database connection test",
      connected: isConnected,
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
