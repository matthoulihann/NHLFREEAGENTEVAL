import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { getPlants } from "@/lib/data"

export default async function Dashboard() {
  return (
    <main className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Database Dashboard</h1>
        <div className="w-24"></div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Plant Care Log</CardTitle>
          <CardDescription>
            View and manage your plant care records from your Railway PostgreSQL database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-4">Loading data...</div>}>
            <PlantTable />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  )
}

async function PlantTable() {
  const plants = await getPlants()

  return <DataTable columns={columns} data={plants} />
}
