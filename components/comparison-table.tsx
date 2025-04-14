"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Player } from "@/lib/types"

interface ComparisonTableProps {
  players: Player[]
}

export function ComparisonTable({ players }: ComparisonTableProps) {
  // Determine if we're comparing skaters or goalies
  const isGoalie = players.some((p) => p.position === "G")

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stat</TableHead>
            {players.map((player) => (
              <TableHead key={player.id}>{player.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Age</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.age}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Position</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.position}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Team</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.team}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Contract Type</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.contractType}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Projected AAV</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>${player.projectedAav.toLocaleString()}M</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Projected Term</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.projectedTerm} years</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Value Tier</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.valueTier}</TableCell>
            ))}
          </TableRow>

          {/* Stats specific to player type */}
          {isGoalie ? (
            <>
              <TableRow>
                <TableCell className="font-medium">Save %</TableCell>
                {players.map((player) => (
                  <TableCell key={player.id}>{player.savePercentage?.toFixed(3) || "-"}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">GAA</TableCell>
                {players.map((player) => (
                  <TableCell key={player.id}>{player.goalsAgainstAverage?.toFixed(2) || "-"}</TableCell>
                ))}
              </TableRow>
            </>
          ) : (
            <>
              <TableRow>
                <TableCell className="font-medium">Points/Game</TableCell>
                {players.map((player) => (
                  <TableCell key={player.id}>{player.pointsPerGame?.toFixed(2) || "-"}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Recent Production</TableCell>
                {players.map((player) => (
                  <TableCell key={player.id}>{player.recentProduction?.toFixed(1) || "-"}</TableCell>
                ))}
              </TableRow>
            </>
          )}

          <TableRow>
            <TableCell className="font-medium">Recent GAR</TableCell>
            {players.map((player) => (
              <TableCell key={player.id}>{player.recentGar?.toFixed(1) || "-"}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
