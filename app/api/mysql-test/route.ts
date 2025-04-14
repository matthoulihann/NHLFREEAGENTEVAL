import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Simple MySQL test starting")

    // Log environment variables (redacted)
    const dbUrl = process.env.DATABASE_URL || "No DATABASE_URL found"
    const redactedUrl = dbUrl.replace(/:([^@]*)@/, ":****@")
    console.log(`Using DATABASE_URL: ${redactedUrl}`)

    // Import mysql2 dynamically
    const mysql = await import("mysql2/promise")
    console.log("MySQL module imported successfully")

    // Create a simple connection (not a pool)
    console.log("Creating connection...")
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // This is the key change
      },
    })
    console.log("Connection created successfully")

    // Run a simple query
    console.log("Executing test query...")
    const [result] = await connection.execute("SELECT 1 as test")
    console.log("Query executed successfully:", result)

    // Close connection
    await connection.end()
    console.log("Connection closed")

    return NextResponse.json({
      success: true,
      message: "MySQL connection test successful",
      result: result,
      time: new Date().toISOString(),
    })
  } catch (error) {
    console.error("MySQL TEST ERROR:", error)

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
