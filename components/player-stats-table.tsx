"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PlayerStat } from "@/lib/types"

interface PlayerStatsTableProps {
  stats: PlayerStat[]
  position?: string // Make position optional
}

export function PlayerStatsTable({ stats, position }: PlayerStatsTableProps) {
  const [activeTab, setActiveTab] = useState("requested") // Set "requested" as default

  if (stats.length === 0) {
    return <div>No stats available</div>
  }

  // Sort stats by season
  const sortedStats = [...stats].sort((a, b) => {
    const seasonA = Number.parseInt(a.season.split("-")[0])
    const seasonB = Number.parseInt(b.season.split("-")[0])
    return seasonB - seasonA
  })

  // Determine if player is a goalie based on position or stats
  // If position is missing, try to infer from the stats
  const isGoalie =
    position === "G" ||
    (position === undefined &&
      stats.some(
        (stat) => stat.position === "G" || stat.savePercentage !== undefined || stat.goalsAgainstAverage !== undefined,
      ))

  return (
    <Tabs defaultValue="requested" onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="requested">Key Stats</TabsTrigger>
        <TabsTrigger value="standard">Standard</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="requested">
        {isGoalie ? <GoalieStandardStats stats={sortedStats} /> : <SkaterRequestedStats stats={sortedStats} />}
      </TabsContent>
      <TabsContent value="standard">
        {isGoalie ? <GoalieStandardStats stats={sortedStats} /> : <SkaterStandardStats stats={sortedStats} />}
      </TabsContent>
      <TabsContent value="advanced">
        {isGoalie ? <GoalieAdvancedStats stats={sortedStats} /> : <SkaterAdvancedStats stats={sortedStats} />}
      </TabsContent>
    </Tabs>
  )
}

function SkaterStandardStats({ stats }: { stats: PlayerStat[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Season</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>GP</TableHead>
            <TableHead>G</TableHead>
            <TableHead>A</TableHead>
            <TableHead>PTS</TableHead>
            <TableHead>+/-</TableHead>
            <TableHead>PIM</TableHead>
            <TableHead>PPG</TableHead>
            <TableHead>SHG</TableHead>
            <TableHead>GWG</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.season}>
              <TableCell className="font-medium">{stat.season}</TableCell>
              <TableCell>{stat.team}</TableCell>
              <TableCell>{stat.gamesPlayed}</TableCell>
              <TableCell>{stat.goals}</TableCell>
              <TableCell>{stat.assists}</TableCell>
              <TableCell>{stat.points}</TableCell>
              <TableCell>{stat.plusMinus}</TableCell>
              <TableCell>{stat.penaltyMinutes}</TableCell>
              <TableCell>{stat.powerPlayGoals}</TableCell>
              <TableCell>{stat.shortHandedGoals}</TableCell>
              <TableCell>{stat.gameWinningGoals}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// New component for the requested stats
function SkaterRequestedStats({ stats }: { stats: PlayerStat[] }) {
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
    <div className="overflow-x-auto">
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
          {stats.map((stat) => (
            <TableRow key={stat.season}>
              <TableCell className="font-medium">{stat.season}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SkaterAdvancedStats({ stats }: { stats: PlayerStat[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Season</TableHead>
            <TableHead>CF%</TableHead>
            <TableHead>iCF</TableHead>
            <TableHead>xG</TableHead>
            <TableHead>ixG</TableHead>
            <TableHead>xG±</TableHead>
            <TableHead>GAR</TableHead>
            <TableHead>WAR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.season}>
              <TableCell className="font-medium">{stat.season}</TableCell>
              <TableCell>{stat.corsiForePercentage?.toFixed(1)}%</TableCell>
              <TableCell>{stat.individualCorsiFor}</TableCell>
              <TableCell>{stat.expectedGoals?.toFixed(1)}</TableCell>
              <TableCell>{stat.individualExpectedGoals?.toFixed(1)}</TableCell>
              <TableCell>{stat.expectedGoalsDifferential?.toFixed(1)}</TableCell>
              <TableCell>{stat.goalsAboveReplacement?.toFixed(1)}</TableCell>
              <TableCell>{stat.winsAboveReplacement?.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function GoalieStandardStats({ stats }: { stats: PlayerStat[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Season</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>GP</TableHead>
            <TableHead>W</TableHead>
            <TableHead>L</TableHead>
            <TableHead>OTL</TableHead>
            <TableHead>SV%</TableHead>
            <TableHead>GAA</TableHead>
            <TableHead>SO</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.season}>
              <TableCell className="font-medium">{stat.season}</TableCell>
              <TableCell>{stat.team}</TableCell>
              <TableCell>{stat.gamesPlayed}</TableCell>
              <TableCell>{stat.wins}</TableCell>
              <TableCell>{stat.losses}</TableCell>
              <TableCell>{stat.otLosses}</TableCell>
              <TableCell>{stat.savePercentage?.toFixed(3)}</TableCell>
              <TableCell>{stat.goalsAgainstAverage?.toFixed(2)}</TableCell>
              <TableCell>{stat.shutouts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function GoalieAdvancedStats({ stats }: { stats: PlayerStat[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Season</TableHead>
            <TableHead>GSAA</TableHead>
            <TableHead>HDSV%</TableHead>
            <TableHead>MDSV%</TableHead>
            <TableHead>LDSV%</TableHead>
            <TableHead>QS%</TableHead>
            <TableHead>GAR</TableHead>
            <TableHead>WAR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.season}>
              <TableCell className="font-medium">{stat.season}</TableCell>
              <TableCell>{stat.goalsSavedAboveAverage?.toFixed(1)}</TableCell>
              <TableCell>{stat.highDangerSavePercentage?.toFixed(3)}</TableCell>
              <TableCell>{stat.mediumDangerSavePercentage?.toFixed(3)}</TableCell>
              <TableCell>{stat.lowDangerSavePercentage?.toFixed(3)}</TableCell>
              <TableCell>{stat.qualityStartPercentage?.toFixed(3)}</TableCell>
              <TableCell>{stat.goalsAboveReplacement?.toFixed(1)}</TableCell>
              <TableCell>{stat.winsAboveReplacement?.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
