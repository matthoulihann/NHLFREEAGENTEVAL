import { NextResponse } from "next/server"
import { getDbPool, testConnection } from "@/lib/db"

// Simple API key check - in production, use a more secure method
const API_KEY = process.env.ADMIN_API_KEY || "nhl-debug-key"

export async function GET(request: Request) {
  try {
    // Get the API key from the Authorization header
    const authHeader = request.headers.get("Authorization")
    const providedKey = authHeader?.replace("Bearer ", "")

    // Check if the API key is valid
    if (!providedKey || providedKey !== API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get database connection status
    const dbConnected = await testConnection()

    // Get environment information
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^@]*)@/, ":****@") : "Not set",
    }

    // Get database pool information if connected
    let poolInfo = null
    if (dbConnected) {
      const pool = await getDbPool()
      poolInfo = {
        connectionLimit: pool._config?.connectionLimit || "unknown",
        queueLimit: pool._config?.queueLimit || "unknown",
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dbConnected,
      environment,
      poolInfo,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
