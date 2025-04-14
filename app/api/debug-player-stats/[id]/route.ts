import { NextResponse } from "next/server"
import { getPlayerStats } from "@/lib/data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("Debug player stats API called for player ID:", params.id)

    const playerId = Number.parseInt(params.id)
    if (isNaN(playerId)) {
      return NextResponse.json({ success: false, error: "Invalid player ID" }, { status: 400 })
    }

    // Get player stats
    const stats = await getPlayerStats(playerId)

    // Check if the player exists in the stats table
    const mysql = await import("mysql2/promise")
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    // Check if player exists in stats table and get raw data
    const [playerData] = await connection.execute(`SELECT * FROM stats WHERE player_id = ?`, [playerId])

    // Get column names from stats table
    const [columns] = await connection.execute(`SHOW COLUMNS FROM stats`)

    // Close connection
    await connection.end()

    return NextResponse.json({
      success: true,
      playerId,
      stats: stats,
      playerExists: Array.isArray(playerData) && playerData.length > 0,
      playerData: playerData,
      statsColumns: columns,
      time: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug player stats API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        time: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
