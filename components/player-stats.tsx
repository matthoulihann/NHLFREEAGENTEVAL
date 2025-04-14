"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPlayerStats } from "@/lib/data"
import type { PlayerStat } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface PlayerStatsProps {
  playerId: number
}

export function PlayerStats({ playerId }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching stats for player ID:", playerId)
        const data = await getPlayerStats(playerId)
        console.log("Stats data received:", data)
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch player stats:", error)
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
    } catch (error) {
      console.error("Failed to fetch debug info:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading stats...</div>
  }

  if (stats.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p>No stats available</p>
          <Button variant="outline" size="sm" onClick={debugStats}>
            Debug Stats
          </Button>
        </div>

        {debugInfo && (
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
  )
}
