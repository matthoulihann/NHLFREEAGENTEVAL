"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Player } from "@/lib/types"

type SortField = "name" | "age" | "projectedAav" | "projectedTerm" | "valueTier"
type SortDirection = "asc" | "desc"

interface PlayerTableProps {
  initialPlayers: Player[]
}

export function PlayerTable({ initialPlayers }: PlayerTableProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [valueFilter, setValueFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter players based on search query and filters
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPosition = positionFilter === "all" || player.position === positionFilter
    const matchesValue = valueFilter === "all" || player.valueTier === valueFilter

    return matchesSearch && matchesPosition && matchesValue
  })

  // Sort players based on sort field and direction
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else if (sortField === "age") {
      return sortDirection === "asc" ? a.age - b.age : b.age - a.age
    } else if (sortField === "projectedAav") {
      return sortDirection === "asc" ? a.projectedAav - b.projectedAav : b.projectedAav - a.projectedAav
    } else if (sortField === "projectedTerm") {
      return sortDirection === "asc" ? a.projectedTerm - b.projectedTerm : b.projectedTerm - a.projectedTerm
    } else {
      return sortDirection === "asc" ? a.valueTier.localeCompare(b.valueTier) : b.valueTier.localeCompare(a.valueTier)
    }
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handlePlayerSelect = (playerId: number) => {
    setSelectedPlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId)
      } else {
        if (prev.length < 3) {
          return [...prev, playerId]
        }
        return prev
      }
    })
  }

  const getValueTierBadge = (valueTier: string) => {
    switch (valueTier) {
      case "Bargain":
        return <Badge className="bg-green-500 hover:bg-green-600">Bargain</Badge>
      case "Fair Deal":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Fair Deal</Badge>
      case "Overpay":
        return <Badge className="bg-red-500 hover:bg-red-600">Overpay</Badge>
      default:
        return <Badge>{valueTier}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {selectedPlayers.length > 0 && (
            <Button size="sm" asChild>
              <Link href={`/compare?ids=${selectedPlayers.join(",")}`}>Compare ({selectedPlayers.length})</Link>
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-md">
          <div>
            <label className="text-sm font-medium mb-1 block">Position</label>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="C">Center</SelectItem>
                <SelectItem value="LW">Left Wing</SelectItem>
                <SelectItem value="RW">Right Wing</SelectItem>
                <SelectItem value="D">Defense</SelectItem>
                <SelectItem value="G">Goalie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Value Tier</label>
            <Select value={valueFilter} onValueChange={setValueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Value Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Value Tiers</SelectItem>
                <SelectItem value="Bargain">Bargain</SelectItem>
                <SelectItem value="Fair Deal">Fair Deal</SelectItem>
                <SelectItem value="Overpay">Overpay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Name
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("age")}>
                <div className="flex items-center">
                  Age
                  {sortField === "age" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("projectedAav")}>
                <div className="flex items-center">
                  Projected AAV
                  {sortField === "projectedAav" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("projectedTerm")}>
                <div className="flex items-center">
                  Projected Term
                  {sortField === "projectedTerm" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("valueTier")}>
                <div className="flex items-center">
                  Value Tier
                  {sortField === "valueTier" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No players found.
                </TableCell>
              </TableRow>
            ) : (
              sortedPlayers.map((player) => (
                <TableRow key={player.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => handlePlayerSelect(player.id)}
                      disabled={selectedPlayers.length >= 3 && !selectedPlayers.includes(player.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/player/${player.id}`} className="font-medium hover:underline">
                      {player.name}
                    </Link>
                  </TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.team}</TableCell>
                  <TableCell>${player.projectedAav.toLocaleString()}M</TableCell>
                  <TableCell>{player.projectedTerm} years</TableCell>
                  <TableCell>{getValueTierBadge(player.valueTier)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
