// Update the PlayerStats component to better handle the mismatch
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlayerStats } from "@/lib/data"
import type { PlayerStat } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Bug, RefreshCw } from "lucide-react"

interface PlayerStatsProps {
  playerId: number
}

export function PlayerStats({ playerId }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [rawData, setRawData] = useState<any>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching stats for player ID:", playerId)
        setLoading(true)
        setError(null)
        setUsingMockData(false)

        const data = await getPlayerStats(playerId)
        console.log("Stats data received:", data)

        // Check if we're using mock data (client-side)
        if (typeof window !== "undefined") {
          setUsingMockData(true)
        }

        setStats(data)
      } catch (err) {
        console.error("Failed to fetch player stats:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [playerId])

  const debugStats = async () => {
    try {
      const response = await fetch(`/api/debug-player-stats/${playerId}`)
      const data = await response.json()
      console.log("Debug info:", data)
      setDebugInfo(data)
      setShowDebug(true)
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    }
  }

  const fetchRawData = async () => {
    try {
      const response = await fetch(`/api/raw-player-data/${playerId}`)
      const data = await response.json()
      console.log("Raw player data:", data)
      setRawData(data)
    } catch (error) {
      console.error("Failed to fetch raw data:", error)
    }
  }

  const createStatsManually = async () => {
    if (!rawData || !rawData.playerData || rawData.playerData.length === 0) {
      await fetchRawData()
      return
    }

    try {
      const playerData = rawData.playerData[0]
      const position = playerData.position || "Unknown"
      const team = playerData.prev_team || "Unknown"

      // Create stats for each season
      const manualStats: PlayerStat[] = []

      // 2022-23 Season
      if (
        playerData.toi_22_23 !== undefined ||
        playerData.goals_22_23 !== undefined ||
        playerData.a1_22_23 !== undefined
      ) {
        manualStats.push({
          playerId: playerId,
          season: "2022-23",
          team: team,
          position: position,
          gamesPlayed: 82, // Default value
          goals: playerData.goals_22_23 !== undefined ? Number(playerData.goals_22_23) : undefined,
          assists: playerData.a1_22_23 !== undefined ? Number(playerData.a1_22_23) : undefined,
          points:
            playerData.goals_22_23 !== undefined && playerData.a1_22_23 !== undefined
              ? Number(playerData.goals_22_23) + Number(playerData.a1_22_23)
              : undefined,
          timeOnIce: playerData.toi_22_23 !== undefined ? Number(playerData.toi_22_23) : undefined,
          goalsAboveReplacement: playerData.gar_22_23 !== undefined ? Number(playerData.gar_22_23) : undefined,
        })
      }

      // 2023-24 Season
      if (
        playerData.toi_23_24 !== undefined ||
        playerData.goals_23_24 !== undefined ||
        playerData.a1_23_24 !== undefined
      ) {
        manualStats.push({
          playerId: playerId,
          season: "2023-24",
          team: team,
          position: position,
          gamesPlayed: 82, // Default value
          goals: playerData.goals_23_24 !== undefined ? Number(playerData.goals_23_24) : undefined,
          assists: playerData.a1_23_24 !== undefined ? Number(playerData.a1_23_24) : undefined,
          points:
            playerData.goals_23_24 !== undefined && playerData.a1_23_24 !== undefined
              ? Number(playerData.goals_23_24) + Number(playerData.a1_23_24)
              : undefined,
          timeOnIce: playerData.toi_23_24 !== undefined ? Number(playerData.toi_23_24) : undefined,
          goalsAboveReplacement: playerData.gar_23_24 !== undefined ? Number(playerData.gar_23_24) : undefined,
        })
      }

      // 2024-25 Season
      if (
        playerData.toi_24_25 !== undefined ||
        playerData.goals_24_25 !== undefined ||
        playerData.a1_24_25 !== undefined
      ) {
        manualStats.push({
          playerId: playerId,
          season: "2024-25",
          team: team,
          position: position,
          gamesPlayed: 82, // Default value
          goals: playerData.goals_24_25 !== undefined ? Number(playerData.goals_24_25) : undefined,
          assists: playerData.a1_24_25 !== undefined ? Number(playerData.a1_24_25) : undefined,
          points:
            playerData.goals_24_25 !== undefined && playerData.a1_24_25 !== undefined
              ? Number(playerData.goals_24_25) + Number(playerData.a1_24_25)
              : undefined,
          timeOnIce: playerData.toi_24_25 !== undefined ? Number(playerData.toi_24_25) : undefined,
          goalsAboveReplacement: playerData.gar_24_25 !== undefined ? Number(playerData.gar_24_25) : undefined,
        })
      }

      console.log("Manually created stats:", manualStats)
      setStats(manualStats)
      setError(null)
    } catch (err) {
      console.error("Failed to create stats manually:", err)
      setError("Failed to create stats manually")
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading stats...</div>
  }

  if (error || stats.length === 0) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading stats</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stats.length === 0 && !error && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No stats available</AlertTitle>
            <AlertDescription>
              {usingMockData
                ? "Using mock data. This may not match the actual database."
                : "No statistics found for this player."}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={debugStats}>
            <Bug className="h-4 w-4 mr-2" />
            Debug Stats
          </Button>

          <Button variant="outline" size="sm" onClick={fetchRawData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Fetch Raw Data
          </Button>

          {rawData && rawData.playerExists && (
            <Button variant="default" size="sm" onClick={createStatsManually}>
              Create Stats Manually
            </Button>
          )}
        </div>

        {debugInfo && showDebug && (
          <div className="mt-4 p-4 bg-muted rounded-md text-sm">
            <p className="font-medium mb-2">Debug Information:</p>
            <p>Player ID: {debugInfo.playerId}</p>
            <p>Player exists in database: {debugInfo.playerExists ? "Yes" : "No"}</p>
            <p>Stats returned: {debugInfo.stats?.length || 0}</p>
            {debugInfo.playerData && debugInfo.playerData.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Player data sample:</p>
                <pre className="text-xs mt-1 p-2 bg-background overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.playerData[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {rawData && (
          <div className="mt-4 p-4 bg-muted rounded-md text-sm">
            <p className="font-medium mb-2">Raw Player Data:</p>
            <p>Player ID: {rawData.playerId}</p>
            <p>Player exists in database: {rawData.playerExists ? "Yes" : "No"}</p>
            {rawData.playerData && rawData.playerData.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Raw data sample:</p>
                <pre className="text-xs mt-1 p-2 bg-background overflow-auto max-h-40">
                  {JSON.stringify(rawData.playerData[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Determine if player is a skater or goalie based on first stat entry
  const isGoalie = stats[0].position === "G"

  // Format time on ice (convert minutes to MM:SS format)
  const formatTOI = (minutes: number | undefined) => {
    if (minutes === undefined) return "-"

    // Convert to minutes per game (assuming 82 games)
    const minutesPerGame = minutes / 82

    // Format as MM:SS
    const mins = Math.floor(minutesPerGame)
    const secs = Math.round((minutesPerGame - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          {usingMockData && (
            <Alert variant="warning" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Using Mock Data</AlertTitle>
              <AlertDescription>This data is from mock data and may not match the actual database.</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
          {!showDebug && (
            <Button variant="outline" size="sm" onClick={debugStats}>
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="standard">
        <TabsList>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="pt-4">
          {isGoalie ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>GP</TableHead>
                  <TableHead>W</TableHead>
                  <TableHead>L</TableHead>
                  <TableHead>OTL</TableHead>
                  <TableHead>GAA</TableHead>
                  <TableHead>SV%</TableHead>
                  <TableHead>SO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.season}>
                    <TableCell>{stat.season}</TableCell>
                    <TableCell>{stat.team}</TableCell>
                    <TableCell>{stat.gamesPlayed}</TableCell>
                    <TableCell>{stat.wins || "-"}</TableCell>
                    <TableCell>{stat.losses || "-"}</TableCell>
                    <TableCell>{stat.otLosses || "-"}</TableCell>
                    <TableCell>{stat.goalsAgainstAverage ? stat.goalsAgainstAverage.toFixed(2) : "-"}</TableCell>
                    <TableCell>{stat.savePercentage ? stat.savePercentage.toFixed(3) : "-"}</TableCell>
                    <TableCell>{stat.shutouts || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>GP</TableHead>
                  <TableHead>G</TableHead>
                  <TableHead>A1</TableHead>
                  <TableHead>P</TableHead>
                  <TableHead>TOI/GP</TableHead>
                  <TableHead>Giveaways</TableHead>
                  <TableHead>Takeaways</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => {
                  // Check if any key stats are missing
                  const hasMissingStats =
                    stat.goals === undefined ||
                    stat.assists === undefined ||
                    stat.timeOnIce === undefined ||
                    stat.giveaways === undefined ||
                    stat.takeaways === undefined

                  return (
                    <TableRow key={stat.season} className={hasMissingStats ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                      <TableCell>{stat.season}</TableCell>
                      <TableCell>{stat.team}</TableCell>
                      <TableCell>{stat.gamesPlayed}</TableCell>
                      <TableCell>{stat.goals !== undefined ? stat.goals : "-"}</TableCell>
                      <TableCell>{stat.assists !== undefined ? stat.assists : "-"}</TableCell>
                      <TableCell>
                        {stat.points !== undefined
                          ? stat.points
                          : stat.goals !== undefined && stat.assists !== undefined
                            ? Number(stat.goals) + Number(stat.assists)
                            : "-"}
                      </TableCell>
                      <TableCell>{formatTOI(stat.timeOnIce)}</TableCell>
                      <TableCell>{stat.giveaways !== undefined ? stat.giveaways : "-"}</TableCell>
                      <TableCell>{stat.takeaways !== undefined ? stat.takeaways : "-"}</TableCell>
                      {hasMissingStats && (
                        <TableCell>
                          <span className="text-amber-600 dark:text-amber-400 text-xs">Some stats unavailable</span>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="pt-4">
          {isGoalie ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>GSAA</TableHead>
                  <TableHead>HDSV%</TableHead>
                  <TableHead>MDSV%</TableHead>
                  <TableHead>LDSV%</TableHead>
                  <TableHead>QS%</TableHead>
                  <TableHead>GAR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.season}>
                    <TableCell>{stat.season}</TableCell>
                    <TableCell>{stat.team}</TableCell>
                    <TableCell>{stat.goalsSavedAboveAverage?.toFixed(2) || "-"}</TableCell>
                    <TableCell>{stat.highDangerSavePercentage?.toFixed(3) || "-"}</TableCell>
                    <TableCell>{stat.mediumDangerSavePercentage?.toFixed(3) || "-"}</TableCell>
                    <TableCell>{stat.lowDangerSavePercentage?.toFixed(3) || "-"}</TableCell>
                    <TableCell>{stat.qualityStartPercentage?.toFixed(3) || "-"}</TableCell>
                    <TableCell>{stat.goalsAboveReplacement?.toFixed(1) || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>iCF</TableHead>
                  <TableHead>ixG</TableHead>
                  <TableHead>GAR</TableHead>
                  <TableHead>WAR</TableHead>
                  <TableHead>TOI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => (
                  <TableRow key={stat.season}>
                    <TableCell>{stat.season}</TableCell>
                    <TableCell>{stat.team}</TableCell>
                    <TableCell>{stat.individualCorsiFor || "-"}</TableCell>
                    <TableCell>{stat.individualExpectedGoals?.toFixed(1) || "-"}</TableCell>
                    <TableCell>{stat.goalsAboveReplacement?.toFixed(1) || "-"}</TableCell>
                    <TableCell>{stat.winsAboveReplacement?.toFixed(1) || "-"}</TableCell>
                    <TableCell>{stat.timeOnIce ? Math.round(stat.timeOnIce) : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {debugInfo && showDebug && (
        <div className="mt-4 p-4 bg-muted rounded-md text-sm">
          <p className="font-medium mb-2">Debug Information:</p>
          <p>Player ID: {debugInfo.playerId}</p>
          <p>Player exists in database: {debugInfo.playerExists ? "Yes" : "No"}</p>
          <p>Stats returned: {debugInfo.stats?.length || 0}</p>
          {debugInfo.playerData && debugInfo.playerData.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Player data sample:</p>
              <pre className="text-xs mt-1 p-2 bg-background overflow-auto max-h-40">
                {JSON.stringify(debugInfo.playerData[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
