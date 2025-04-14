import type { Player, PlayerStat } from "./types"
import { isClient } from "@/lib/utils"

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
  console.log("getPlayers called, isClient:", isClient)

  if (isClient) {
    console.log("Using mock data (client-side)")
    return mockPlayers
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockPlayers
    }

    console.log("Executing query to fetch all players")
    const [rows] = await pool.query(`
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
        CONCAT('Value per GAR: $', pc.value_per_gar, 'k. ', 
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

    console.log(`Query successful, fetched ${(rows as any[]).length} players`)

    return (rows as Player[]).map((player) => ({
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
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
  if (isClient) {
    console.log(`Client-side: Using mock data for player ID ${id}`)
    return mockPlayers.find((p) => p.id === id) || null
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn(`MySQL pool not available, using mock data for player ID ${id}`)
      return mockPlayers.find((p) => p.id === id) || null
    }

    console.log(`Fetching player with ID ${id} from database`)
    const [rows] = await pool.query(
      `
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
        CONCAT('Value per GAR: $', pc.value_per_gar, 'k. ', 
               CASE 
                 WHEN pc.value_category = 'Bargain' THEN 'Player provides excellent value relative to projected cost.'
                 WHEN pc.value_category = 'Fair Deal' THEN 'Contract value aligns well with expected performance.'
                 WHEN pc.value_category = 'Overpay' THEN 'Contract exceeds expected value based on projected performance.'
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
      WHERE pc.player_id = ?
    `,
      [id],
    )

    const players = rows as Player[]
    if (players.length === 0) {
      console.log(`No player found with ID ${id} in database, using mock data`)
      return mockPlayers.find((p) => p.id === id) || null
    }

    const player = players[0]
    console.log(`Found player in database: ${player.name} (ID: ${player.id})`)

    return {
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
      recentProduction: player.recentProduction ? Number(player.recentProduction) : undefined,
      recentGar: player.recentGar ? Number(player.recentGar) : undefined,
      pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame) : undefined,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : undefined,
      goalsAgainstAverage: player.goalsAgainstAverage ? Number(player.goalsAgainstAverage) : undefined,
    }
  } catch (error) {
    console.error(`Failed to fetch player with id ${id}:`, error)
    console.log(`Falling back to mock data for player ID ${id}`)
    return mockPlayers.find((p) => p.id === id) || null // Fallback to mock data
  }
}

// Function to get players by IDs
export async function getPlayersByIds(ids: number[]): Promise<Player[]> {
  if (isClient) {
    return mockPlayers.filter((p) => ids.includes(p.id))
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockPlayers.filter((p) => ids.includes(p.id))
    }

    const placeholders = ids.map(() => "?").join(",")
    const [rows] = await pool.query(
      `
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
        CONCAT('Value per GAR: $', pc.value_per_gar, 'k. ', 
               CASE 
                 WHEN pc.value_category = 'Bargain' THEN 'Player provides excellent value relative to projected cost.'
                 WHEN pc.value_category = 'Fair Deal' THEN 'Contract value aligns well with expected performance.'
                 WHEN pc.value_category = 'Overpay' THEN 'Contract exceeds expected value based on projected performance.'
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
      WHERE pc.player_id IN (${placeholders})
    `,
      ids,
    )

    return (rows as Player[]).map((player) => ({
      ...player,
      // Ensure numeric values are properly typed
      projectedAav: Number(player.projectedAav),
      projectedTerm: Number(player.projectedTerm),
      recentProduction: player.recentProduction ? Number(player.recentProduction) : undefined,
      recentGar: player.recentGar ? Number(player.recentGar) : undefined,
      pointsPerGame: player.pointsPerGame ? Number(player.pointsPerGame) : undefined,
      savePercentage: player.savePercentage ? Number(player.savePercentage) : undefined,
      goalsAgainstAverage: player.goalsAgainstAverage ? Number(player.goalsAgainstAverage) : undefined,
    }))
  } catch (error) {
    console.error("Failed to fetch players:", error)
    return mockPlayers.filter((p) => ids.includes(p.id)) // Fallback to mock data
  }
}

// Define the GarData type
export interface GarData {
  playerId: number
  season: string
  gar: number
}

// Function to get player GAR data
export async function getPlayerGarData(playerId: number): Promise<GarData[]> {
  if (isClient) {
    return mockGarData.filter((d) => d.playerId === playerId)
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockGarData.filter((d) => d.playerId === playerId)
    }

    const [rows] = await pool.query(
      `
      SELECT 
        player_id as playerId,
        '2022-23' as season,
        gar_22_23 as gar
      FROM stats
      WHERE player_id = ?
      UNION
      SELECT 
        player_id as playerId,
        '2023-24' as season,
        gar_23_24 as gar
      FROM stats
      WHERE player_id = ?
      UNION
      SELECT 
        player_id as playerId,
        '2024-25' as season,
        gar_24_25 as gar
      FROM stats
      WHERE player_id = ?
      ORDER BY season
    `,
      [playerId, playerId, playerId],
    )

    return (rows as GarData[]).map((data) => ({
      ...data,
      gar: Number(data.gar) || 0, // Handle null values
    }))
  } catch (error) {
    console.error(`Failed to fetch GAR data for player with id ${playerId}:`, error)
    return mockGarData.filter((d) => d.playerId === playerId) // Fallback to mock data
  }
}

// Function to get players GAR data for comparison
export async function getPlayersGarData(playerIds: number[]): Promise<GarData[]> {
  if (isClient) {
    return mockGarData.filter((d) => playerIds.includes(d.playerId))
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockGarData.filter((d) => playerIds.includes(d.playerId))
    }

    const placeholders = playerIds.map(() => "?").join(",")
    const allParams = [...playerIds, ...playerIds, ...playerIds] // Repeat IDs for each season

    const [rows] = await pool.query(
      `
      SELECT 
        player_id as playerId,
        '2022-23' as season,
        gar_22_23 as gar
      FROM stats
      WHERE player_id IN (${placeholders})
      UNION
      SELECT 
        player_id as playerId,
        '2023-24' as season,
        gar_23_24 as gar
      FROM stats
      WHERE player_id IN (${placeholders})
      UNION
      SELECT 
        player_id as playerId,
        '2024-25' as season,
        gar_24_25 as gar
      FROM stats
      WHERE player_id IN (${placeholders})
      ORDER BY playerId, season
    `,
      allParams,
    )

    return (rows as GarData[]).map((data) => ({
      ...data,
      gar: Number(data.gar) || 0, // Handle null values
    }))
  } catch (error) {
    console.error("Failed to fetch players GAR data:", error)
    return mockGarData.filter((d) => playerIds.includes(d.playerId)) // Fallback to mock data
  }
}

// Function to get player stats
export async function getPlayerStats(playerId: number): Promise<PlayerStat[]> {
  console.log(`getPlayerStats called for player ID: ${playerId}, isClient:`, isClient)

  if (isClient) {
    console.log("Using mock player stats (client-side)")
    return mockPlayerStats.filter((s) => s.playerId === playerId)
  }

  try {
    const pool = await getPool()
    if (!pool) {
      console.warn("MySQL pool not available, using mock data")
      return mockPlayerStats.filter((s) => s.playerId === playerId)
    }

    console.log("Executing query to fetch player stats")

    // First, check if the player exists in the stats table
    const [playerCheck] = await pool.query(
      `SELECT player_id, player_name, position, prev_team FROM stats WHERE player_id = ?`,
      [playerId],
    )

    if (Array.isArray(playerCheck) && playerCheck.length === 0) {
      console.warn(`No player found with ID ${playerId} in stats table`)
      return []
    }

    // Get all player data in a single query to avoid multiple database calls
    const [playerData] = await pool.query(`SELECT * FROM stats WHERE player_id = ?`, [playerId])

    if (Array.isArray(playerData) && playerData.length === 0) {
      console.warn(`No stats found for player ID ${playerId}`)
      return []
    }

    // Log the raw player data for debugging
    console.log(`Raw player data for ID ${playerId}:`, JSON.stringify(playerData[0], null, 2))

    // Create stats for each season using the data from the single row
    const player = playerData[0]
    const position = player.position || "Unknown"
    const team = player.prev_team || "Unknown"
    const playerName = player.player_name || "Unknown"

    console.log(`Processing stats for ${playerName} (${position}) on ${team}`)

    // Create an array of stats for each season
    const stats: PlayerStat[] = []

    // Helper function to check if a season has meaningful data
    const seasonHasData = (seasonSuffix: string) => {
      const hasGoals = player[`goals_${seasonSuffix}`] !== undefined && player[`goals_${seasonSuffix}`] !== null
      const hasAssists = player[`a1_${seasonSuffix}`] !== undefined && player[`a1_${seasonSuffix}`] !== null
      const hasTOI = player[`toi_${seasonSuffix}`] !== undefined && player[`toi_${seasonSuffix}`] !== null
      const hasGAR = player[`gar_${seasonSuffix}`] !== undefined && player[`gar_${seasonSuffix}`] !== null

      return hasGoals || hasAssists || hasTOI || hasGAR
    }

    // Only add seasons that have data
    // 2022-23 Season
    if (seasonHasData("22_23")) {
      stats.push({
        playerId: playerId,
        season: "2022-23",
        team: team,
        position: position,
        gamesPlayed: player.gp_22_23 || 82, // Default to 82 if not specified
        goals: player.goals_22_23 !== undefined ? Number(player.goals_22_23) : undefined,
        assists: player.a1_22_23 !== undefined ? Number(player.a1_22_23) : undefined,
        points:
          player.goals_22_23 !== undefined && player.a1_22_23 !== undefined
            ? Number(player.goals_22_23) + Number(player.a1_22_23)
            : undefined,
        timeOnIce: player.toi_22_23 !== undefined ? Number(player.toi_22_23) : undefined,
        giveaways: player.giveaways_22_23 !== undefined ? Number(player.giveaways_22_23) : undefined,
        takeaways: player.takeaways_22_23 !== undefined ? Number(player.takeaways_22_23) : undefined,
        individualCorsiFor: player.icf_22_23 !== undefined ? Number(player.icf_22_23) : undefined,
        individualExpectedGoals: player.ixg_22_23 !== undefined ? Number(player.ixg_22_23) : undefined,
        goalsAboveReplacement: player.gar_22_23 !== undefined ? Number(player.gar_22_23) : undefined,
        winsAboveReplacement: player.war_22_23 !== undefined ? Number(player.war_22_23) : undefined,
      })
    }

    // 2023-24 Season
    if (seasonHasData("23_24")) {
      stats.push({
        playerId: playerId,
        season: "2023-24",
        team: team,
        position: position,
        gamesPlayed: player.gp_23_24 || 82, // Default to 82 if not specified
        goals: player.goals_23_24 !== undefined ? Number(player.goals_23_24) : undefined,
        assists: player.a1_23_24 !== undefined ? Number(player.a1_23_24) : undefined,
        points:
          player.goals_23_24 !== undefined && player.a1_23_24 !== undefined
            ? Number(player.goals_23_24) + Number(player.a1_23_24)
            : undefined,
        timeOnIce: player.toi_23_24 !== undefined ? Number(player.toi_23_24) : undefined,
        giveaways: player.giveaways_23_24 !== undefined ? Number(player.giveaways_23_24) : undefined,
        takeaways: player.takeaways_23_24 !== undefined ? Number(player.takeaways_23_24) : undefined,
        individualCorsiFor: player.icf_23_24 !== undefined ? Number(player.icf_23_24) : undefined,
        individualExpectedGoals: player.ixg_23_24 !== undefined ? Number(player.ixg_23_24) : undefined,
        goalsAboveReplacement: player.gar_23_24 !== undefined ? Number(player.gar_23_24) : undefined,
        winsAboveReplacement: player.war_23_24 !== undefined ? Number(player.war_23_24) : undefined,
      })
    }

    // 2024-25 Season
    if (seasonHasData("24_25")) {
      stats.push({
        playerId: playerId,
        season: "2024-25",
        team: team,
        position: position,
        gamesPlayed: player.gp_24_25 || 82, // Default to 82 if not specified
        goals: player.goals_24_25 !== undefined ? Number(player.goals_24_25) : undefined,
        assists: player.a1_24_25 !== undefined ? Number(player.a1_24_25) : undefined,
        points:
          player.goals_24_25 !== undefined && player.a1_24_25 !== undefined
            ? Number(player.goals_24_25) + Number(player.a1_24_25)
            : undefined,
        timeOnIce: player.toi_24_25 !== undefined ? Number(player.toi_24_25) : undefined,
        giveaways: player.giveaways_24_25 !== undefined ? Number(player.giveaways_24_25) : undefined,
        takeaways: player.takeaways_24_25 !== undefined ? Number(player.takeaways_24_25) : undefined,
        individualCorsiFor: player.icf_24_25 !== undefined ? Number(player.icf_24_25) : undefined,
        individualExpectedGoals: player.ixg_24_25 !== undefined ? Number(player.ixg_24_25) : undefined,
        goalsAboveReplacement: player.gar_24_25 !== undefined ? Number(player.gar_24_25) : undefined,
        winsAboveReplacement: player.war_24_25 !== undefined ? Number(player.war_24_25) : undefined,
      })
    }

    console.log(`Created ${stats.length} stat entries for player ID ${playerId}`)
    return stats
  } catch (error) {
    console.error(`Failed to fetch stats for player with id ${playerId}:`, error)
    return mockPlayerStats.filter((s) => s.playerId === playerId) // Fallback to mock data
  }
}

// For backward compatibility with the original code
export async function getPlants() {
  return []
}

// Mock data for preview environment
const mockPlayers: Player[] = [
  {
    id: 1,
    name: "Connor McDavid",
    age: 28,
    position: "C",
    team: "Edmonton",
    contractType: "UFA",
    projectedAav: 15.5,
    projectedTerm: 8,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite center who drives play and produces at historic levels. Worth every penny of a max contract.",
    recentProduction: 152,
    recentGar: 24.5,
    pointsPerGame: 1.85,
  },
  {
    id: 2,
    name: "Leon Draisaitl",
    age: 29,
    position: "C",
    team: "Edmonton",
    contractType: "UFA",
    projectedAav: 14,
    projectedTerm: 8,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite offensive center with consistent production. Slight defensive concerns but offensive upside outweighs them.",
    recentProduction: 127,
    recentGar: 18.2,
    pointsPerGame: 1.55,
  },
  {
    id: 3,
    name: "Mitch Marner",
    age: 28,
    position: "RW",
    team: "Toronto",
    contractType: "UFA",
    projectedAav: 11.5,
    projectedTerm: 7,
    valueTier: "Overpay",
    valueAssessment:
      "Elite playmaker but playoff performance raises questions about long-term value at this price point.",
    recentProduction: 98,
    recentGar: 15.3,
    pointsPerGame: 1.2,
  },
  {
    id: 4,
    name: "Auston Matthews",
    age: 28,
    position: "C",
    team: "Toronto",
    contractType: "UFA",
    projectedAav: 14,
    projectedTerm: 8,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite goal-scoring center with improving defensive game. Worth the investment for a franchise player.",
    recentProduction: 112,
    recentGar: 21.7,
    pointsPerGame: 1.37,
  },
  {
    id: 5,
    name: "Igor Shesterkin",
    age: 29,
    position: "G",
    team: "NY Rangers",
    contractType: "UFA",
    projectedAav: 10.5,
    projectedTerm: 7,
    valueTier: "Bargain",
    valueAssessment:
      "Elite goaltender entering prime years. Has consistently shown ability to steal games and perform in high-pressure situations.",
    savePercentage: 0.924,
    goalsAgainstAverage: 2.25,
    recentGar: 22.1,
  },
  {
    id: 6,
    name: "Cale Makar",
    age: 26,
    position: "D",
    team: "Colorado",
    contractType: "RFA",
    projectedAav: 12.5,
    projectedTerm: 8,
    valueTier: "Bargain",
    valueAssessment:
      "Generational defenseman who excels in all facets of the game. Worth every penny of a max contract.",
    recentProduction: 85,
    recentGar: 19.8,
    pointsPerGame: 1.04,
  },
  {
    id: 7,
    name: "Brady Tkachuk",
    age: 26,
    position: "LW",
    team: "Ottawa",
    contractType: "UFA",
    projectedAav: 9.5,
    projectedTerm: 8,
    valueTier: "Fair Deal",
    valueAssessment:
      "Physical power forward who drives play and provides leadership. Consistent production with room to grow.",
    recentProduction: 78,
    recentGar: 12.5,
    pointsPerGame: 0.95,
  },
  {
    id: 8,
    name: "Juuse Saros",
    age: 30,
    position: "G",
    team: "Nashville",
    contractType: "UFA",
    projectedAav: 8.5,
    projectedTerm: 6,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite goaltender who has consistently performed well behind varying quality of defense. Size concerns are offset by technical excellence.",
    savePercentage: 0.918,
    goalsAgainstAverage: 2.35,
    recentGar: 15.7,
  },
  {
    id: 9,
    name: "Mikko Rantanen",
    age: 29,
    position: "RW",
    team: "Colorado",
    contractType: "UFA",
    projectedAav: 11,
    projectedTerm: 7,
    valueTier: "Fair Deal",
    valueAssessment:
      "Elite winger with size and skill. Consistent production and playoff performance justify the investment.",
    recentProduction: 105,
    recentGar: 16.2,
    pointsPerGame: 1.28,
  },
  {
    id: 10,
    name: "Jake Oettinger",
    age: 26,
    position: "G",
    team: "Dallas",
    contractType: "RFA",
    projectedAav: 8,
    projectedTerm: 8,
    valueTier: "Bargain",
    valueAssessment:
      "Young goaltender entering prime with elite potential. Size, athleticism, and mental toughness make him worth the long-term investment.",
    savePercentage: 0.915,
    goalsAgainstAverage: 2.4,
    recentGar: 14.3,
  },
]

// Mock GAR data for players
const mockGarData: GarData[] = [
  // McDavid
  { playerId: 1, season: "2022-23", gar: 22.1 },
  { playerId: 1, season: "2023-24", gar: 24.5 },
  { playerId: 1, season: "2024-25", gar: 23.8 },

  // Draisaitl
  { playerId: 2, season: "2022-23", gar: 17.5 },
  { playerId: 2, season: "2023-24", gar: 18.2 },
  { playerId: 2, season: "2024-25", gar: 16.9 },

  // Marner
  { playerId: 3, season: "2022-23", gar: 14.8 },
  { playerId: 3, season: "2023-24", gar: 15.3 },
  { playerId: 3, season: "2024-25", gar: 13.7 },

  // Matthews
  { playerId: 4, season: "2022-23", gar: 19.5 },
  { playerId: 4, season: "2023-24", gar: 21.7 },
  { playerId: 4, season: "2024-25", gar: 20.3 },

  // Shesterkin
  { playerId: 5, season: "2022-23", gar: 20.8 },
  { playerId: 5, season: "2023-24", gar: 22.1 },
  { playerId: 5, season: "2024-25", gar: 19.5 },

  // Makar
  { playerId: 6, season: "2022-23", gar: 18.2 },
  { playerId: 6, season: "2023-24", gar: 19.8 },
  { playerId: 6, season: "2024-25", gar: 21.3 },

  // Tkachuk
  { playerId: 7, season: "2022-23", gar: 11.7 },
  { playerId: 7, season: "2023-24", gar: 12.5 },
  { playerId: 7, season: "2024-25", gar: 13.8 },

  // Saros
  { playerId: 8, season: "2022-23", gar: 16.2 },
  { playerId: 8, season: "2023-24", gar: 15.7 },
  { playerId: 8, season: "2024-25", gar: 14.9 },

  // Rantanen
  { playerId: 9, season: "2022-23", gar: 15.5 },
  { playerId: 9, season: "2023-24", gar: 16.2 },
  { playerId: 9, season: "2024-25", gar: 15.8 },

  // Oettinger
  { playerId: 10, season: "2022-23", gar: 13.1 },
  { playerId: 10, season: "2023-24", gar: 14.3 },
  { playerId: 10, season: "2024-25", gar: 15.7 },
]

// Mock player stats
const mockPlayerStats: PlayerStat[] = [
  // McDavid 2022-23
  {
    playerId: 1,
    season: "2022-23",
    team: "Edmonton",
    position: "C",
    gamesPlayed: 82,
    goals: 64,
    assists: 89,
    points: 153,
    plusMinus: 22,
    penaltyMinutes: 36,
    powerPlayGoals: 21,
    shortHandedGoals: 4,
    gameWinningGoals: 12,
    corsiForePercentage: 56.2,
    expectedGoals: 45.7,
    expectedGoalsDifferential: 15.3,
    individualCorsiFor: 412,
    individualExpectedGoals: 38.5,
    goalsAboveReplacement: 22.1,
    winsAboveReplacement: 3.7,
    timeOnIce: 1722,
    giveaways: 62,
    takeaways: 92,
  },
  // McDavid 2023-24
  {
    playerId: 1,
    season: "2023-24",
    team: "Edmonton",
    position: "C",
    gamesPlayed: 76,
    goals: 42,
    assists: 110,
    points: 152,
    plusMinus: 25,
    penaltyMinutes: 42,
    powerPlayGoals: 18,
    shortHandedGoals: 2,
    gameWinningGoals: 9,
    corsiForePercentage: 57.5,
    expectedGoals: 43.2,
    expectedGoalsDifferential: 16.8,
    individualCorsiFor: 398,
    individualExpectedGoals: 36.8,
    goalsAboveReplacement: 24.5,
    winsAboveReplacement: 4.1,
    timeOnIce: 1600,
    giveaways: 58,
    takeaways: 88,
  },
  // McDavid 2024-25
  {
    playerId: 1,
    season: "2024-25",
    team: "Edmonton",
    position: "C",
    gamesPlayed: 80,
    goals: 51,
    assists: 95,
    points: 146,
    plusMinus: 20,
    penaltyMinutes: 38,
    powerPlayGoals: 20,
    shortHandedGoals: 3,
    gameWinningGoals: 11,
    corsiForePercentage: 56.8,
    expectedGoals: 44.5,
    expectedGoalsDifferential: 15.8,
    individualCorsiFor: 405,
    individualExpectedGoals: 37.6,
    goalsAboveReplacement: 23.8,
    winsAboveReplacement: 4.0,
    timeOnIce: 1680,
    giveaways: 60,
    takeaways: 90,
  },

  // Shesterkin 2022-23
  {
    playerId: 5,
    season: "2022-23",
    team: "NY Rangers",
    position: "G",
    gamesPlayed: 58,
    wins: 37,
    losses: 13,
    otLosses: 8,
    savePercentage: 0.926,
    goalsAgainstAverage: 2.22,
    shutouts: 3,
    goalsSavedAboveAverage: 32.5,
    highDangerSavePercentage: 0.856,
    mediumDangerSavePercentage: 0.923,
    lowDangerSavePercentage: 0.975,
    qualityStartPercentage: 0.724,
    goalsAboveReplacement: 20.8,
    winsAboveReplacement: 3.5,
    timeOnIce: 3480,
    giveaways: 2,
    takeaways: 1,
  },
  // Shesterkin 2023-24
  {
    playerId: 5,
    season: "2023-24",
    team: "NY Rangers",
    position: "G",
    gamesPlayed: 62,
    wins: 41,
    losses: 15,
    otLosses: 6,
    savePercentage: 0.924,
    goalsAgainstAverage: 2.25,
    shutouts: 5,
    goalsSavedAboveAverage: 34.2,
    highDangerSavePercentage: 0.852,
    mediumDangerSavePercentage: 0.921,
    lowDangerSavePercentage: 0.972,
    qualityStartPercentage: 0.718,
    goalsAboveReplacement: 22.1,
    winsAboveReplacement: 3.7,
    timeOnIce: 3720,
    giveaways: 3,
    takeaways: 2,
  },
  // Shesterkin 2024-25
  {
    playerId: 5,
    season: "2024-25",
    team: "NY Rangers",
    position: "G",
    gamesPlayed: 55,
    wins: 35,
    losses: 14,
    otLosses: 6,
    savePercentage: 0.92,
    goalsAgainstAverage: 2.32,
    shutouts: 4,
    goalsSavedAboveAverage: 30.1,
    highDangerSavePercentage: 0.848,
    mediumDangerSavePercentage: 0.918,
    lowDangerSavePercentage: 0.97,
    qualityStartPercentage: 0.705,
    goalsAboveReplacement: 19.5,
    winsAboveReplacement: 3.3,
    timeOnIce: 3300,
    giveaways: 2,
    takeaways: 1,
  },
]
