import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Table info API called")

    // Dynamically import mysql2 (only on server)
    const mysql = await import("mysql2/promise")

    // Create a direct connection
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    // Get table information
    console.log("Checking table structure...")

    // Check if the stats table exists and get its structure
    const [statsTable] = await connection.execute(`
      SHOW TABLES LIKE 'stats'
    `)

    const [projectedTable] = await connection.execute(`
      SHOW TABLES LIKE 'projected_contracts'
    `)

    // Get column information for stats table if it exists
    let statsColumns = []
    if (Array.isArray(statsTable) && statsTable.length > 0) {
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM stats
      `)
      statsColumns = columns
    }

    // Get column information for projected_contracts table if it exists
    let projectedColumns = []
    if (Array.isArray(projectedTable) && projectedTable.length > 0) {
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM projected_contracts
      `)
      projectedColumns = columns
    }

    // Get sample data
    let statsSample = []
    if (Array.isArray(statsTable) && statsTable.length > 0) {
      const [rows] = await connection.execute(`
        SELECT * FROM stats LIMIT 1
      `)
      statsSample = rows
    }

    let projectedSample = []
    if (Array.isArray(projectedTable) && projectedTable.length > 0) {
      const [rows] = await connection.execute(`
        SELECT * FROM projected_contracts LIMIT 1
      `)
      projectedSample = rows
    }

    // Close the connection
    await connection.end()

    return NextResponse.json({
      success: true,
      tables: {
        stats: {
          exists: Array.isArray(statsTable) && statsTable.length > 0,
          columns: statsColumns,
          sample: statsSample,
        },
        projected_contracts: {
          exists: Array.isArray(projectedTable) && projectedTable.length > 0,
          columns: projectedColumns,
          sample: projectedSample,
        },
      },
      time: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Table info API error:", error)
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
