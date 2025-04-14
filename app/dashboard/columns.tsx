"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

export type Plant = {
  id: number
  plant_name: string
  care_date: string
}

export const columns: ColumnDef<Plant>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "plant_name",
    header: "Plant Name",
  },
  {
    accessorKey: "care_date",
    header: "Care Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("care_date"))
      return format(date, "PPP")
    },
  },
]
