// Replace the entire file with this complete version
import type { Player, PlayerStat, GarData } from "./types"
import { isClient } from "@/lib/utils"
import { executeQuery } from "./db"

// Only import mysql on the server side
let mysql: any = null

// Use a dynamic import for mysql2 to prevent client-side errors
async function loadMysql() {
  if (typeof window === "undefined") {
    try {
      // We're on the server - dynamically import mysql2
      mysql = await import("mysql2/promise")
      console.log("MySQL module loaded successfully")
      return true
    } catch (error) {
      console.error("Failed to load mysql2:", error)
      return false
    }
  }
  return false
}

// Create a connection pool to the MySQL database
let pool: any = null

// Initialize the connection pool
async function getPool() {
  if (!pool && !mysql) {
    // Try to load MySQL first
    const loaded = await loadMysql()
    if (!loaded) {
      console.warn("MySQL could not be loaded, using mock data")
      return null
    }
  }

  if (!pool && mysql) {
    try {
      // Log the database URL (with password redacted for security)
      const dbUrl = process.env.DATABASE_URL || "No DATABASE_URL found"
      const redactedUrl = dbUrl.replace(/:([^@]*)@/, ":****@")
      console.log(`Attempting to connect to database: ${redactedUrl}`)

      // For Railway, we need to parse the connection string and add SSL options
      const connectionConfig = {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
          // Changed to false to accept self-signed certificates
          rejectUnauthorized: false,
        },
      }

      pool = mysql.createPool(connectionConfig)
      console.log("MySQL pool created successfully")

      // Test the connection
      pool
        .query("SELECT 1")
        .then(() => {
          console.log("Database connection test successful")
        })
        .catch((err: any) => {
          console.error("Database connection test failed:", err)
        })
    } catch (error) {
      console.error("Failed to create MySQL pool:", error)
    }
  }
  return pool
}

// Function to get all players
export async function getPlayers(): Promise<Player[]> {
  console.log("getPlayers called, isClient:", isClient())

  if (isClient()) {
    console.log("Using mock data (client-side)")
    return mockPlayers
  }

  try {
    const rows = await executeQuery(`
      SELECT 
        pc.player_id as id,
        pc.player_name as name,
        pc.age,
        s.position,
        s.prev_team as team,
        s.contract_type as contractType,
        pc.aav as projectedAav,
        pc.contract_term as projectedTerm,
        pc.value_category as valueTier,
        pc.projected_gar_25_26 as projectedGar2526,
        CONCAT('Value per GAR: ', pc.value_per_gar, 'k. ', 
               CASE 
                 WHEN pc.value_category = 'Bargain' THEN 'Player provides excellent value relative to projected cost.'
                 WHEN pc.value_category = 'Fair Deal' THEN 'Contract value aligns well with expected performance.'
                 WHEN pc.value_category = 'Overpay' THEN 'Contract exceeds expected value based on projected performance.'
                 ELSE 'Contract value assessment pending.'
               END) as valueAssessment,
        (s.goals_24_25 + s.a1_24_25) as recentProduction,
        s.gar_24_25 as recentGar,
        CASE 
          WHEN s.position = 'G' THEN NULL
          ELSE (s.goals_24_25 + s.a1_24_25) / 82
        END as pointsPerGame,
        CASE 
          WHEN s.position = 'G' THEN 0.915
          ELSE NULL
        END as savePercentage,
        CASE 
          WHEN s.position = 'G' THEN 2.50
          ELSE NULL
        END as goalsAgainstAverage
      FROM projected_contracts pc
      LEFT JOIN stats s ON pc.player_id = s.player_id
      ORDER BY pc.aav DESC
    `)

    console.log(`Query successful, fetched ${rows.length} players`)

    return (rows as Player[]).map((player) => ({
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
      projectedGar2526: player.projectedGar2526 ? Number(player.projectedGar2526) : undefined,
      recentProduction: player.recentProduction ? Number(player.recentProduction) : undefined,
      recentGar: player.recentGar ? Number(player.recentGar) : undefined,
      pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame) : undefined,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : undefined,
      goalsAgainstAverage: player.goalsAgainstAverage ? Number(player.goalsAgainstAverage) : undefined,
    }))
  } catch (error) {
    console.error("Failed to fetch players:", error)
    return mockPlayers // Fallback to mock data
  }
}

// Function to get player by ID
export async function getPlayerById(id: number): Promise<Player | null> {

