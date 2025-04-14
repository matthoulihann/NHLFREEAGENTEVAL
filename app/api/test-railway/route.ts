import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Railway database connection test API called")

    // Log environment variables (redacted for security)
    const dbUrl = process.env.DATABASE_URL || "No DATABASE_URL found"
    const redactedUrl = dbUrl.replace(/:([^@]*)@/, ":****@")
    console.log(`DATABASE_URL: ${redactedUrl}`)

    // Dynamically import mysql2 (only on server)
    const mysql = await import("mysql2/promise")

    // Create a direct connection to test (not using the pool)
    console.log("Creating direct connection to Railway database...")

    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Changed to false
      },
    })

    console.log("Connection established, testing query...")

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test")

    // Close the connection
    await connection.end()

    return NextResponse.json({
      success: true,
      message: "Railway database connection test successful",
      testResult: rows[0].test,
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Railway database test API error:", error)
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
