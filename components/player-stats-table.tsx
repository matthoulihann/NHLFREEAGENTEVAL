"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PlayerStat } from "@/lib/types"

interface PlayerStatsTableProps {
  stats: PlayerStat[]
  position: string
}

export function PlayerStatsTable({ stats, position }: PlayerStatsTableProps) {
  const [activeTab, setActiveTab] = useState("standard")

  if (stats.length === 0) {
    return <div>No stats available</div>
  }

  // Sort stats by season
  const sortedStats = [...stats].sort((a, b) => {
    const seasonA = Number.parseInt(a.season.split("-")[0])
    const seasonB = Number.parseInt(b.season.split("-")[0])
    return seasonB - seasonA
  })

  return (
    <Tabs defaultValue="standard" onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="standard">Standard</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="standard">
        {position === "G" ? <GoalieStandardStats stats={sortedStats} /> : <SkaterStandardStats stats={sortedStats} />}
      </TabsContent>
      <TabsContent value="advanced">
        {position === "G" ? <GoalieAdvancedStats stats={sortedStats} /> : <SkaterAdvancedStats stats={sortedStats} />}
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
