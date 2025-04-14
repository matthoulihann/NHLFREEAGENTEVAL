"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, Train } from "lucide-react"

export function DbConnectionTest() {
  const [loading, setLoading] = useState(false)
  const [railwayLoading, setRailwayLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [railwayResult, setRailwayResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [railwayError, setRailwayError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const testRailwayConnection = async () => {
    setRailwayLoading(true)
    setRailwayError(null)

    try {
      const response = await fetch("/api/test-railway")
      const data = await response.json()
      setRailwayResult(data)
    } catch (err) {
      setRailwayError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setRailwayLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Test the connection to your MySQL database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={testConnection} disabled={loading}>
              <Database className="mr-2 h-4 w-4" />
              {loading ? "Testing..." : "Test Connection"}
            </Button>

            <Button onClick={testRailwayConnection} disabled={railwayLoading} variant="outline">
              <Train className="mr-2 h-4 w-4" />
              {railwayLoading ? "Testing..." : "Test Railway Connection"}
            </Button>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Connection Successful" : "Connection Failed"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {result.success ? (
                  <div>
                    <p>Found {result.playerCount} players in the database.</p>
                    {result.usingMockData && (
                      <p className="text-amber-500 font-medium mt-1">
                        Warning: Using mock data. Database connection may not be working correctly.
                      </p>
                    )}
                    <p className="text-xs mt-1">Environment: {result.environment}</p>
                  </div>
                ) : (
                  <p>{result.error || "Unknown error"}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {railwayResult && (
            <Alert variant={railwayResult.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {railwayResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {railwayResult.success ? "Railway Connection Successful" : "Railway Connection Failed"}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {railwayResult.success ? (
                  <div>
                    <p>Direct connection to Railway database successful.</p>
                    <p className="text-xs mt-1">Environment: {railwayResult.environment}</p>
                  </div>
                ) : (
                  <p>{railwayResult.error || "Unknown error"}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {railwayError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Railway Error</AlertTitle>
              <AlertDescription>{railwayError}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
