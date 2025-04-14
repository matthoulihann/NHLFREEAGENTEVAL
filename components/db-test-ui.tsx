"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, Info } from "lucide-react"

export function DbTestUI() {
  const [loading, setLoading] = useState(false)
  const [tableInfoLoading, setTableInfoLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [tableInfo, setTableInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [tableInfoError, setTableInfoError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/mysql-test")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkTableInfo = async () => {
    setTableInfoLoading(true)
    setTableInfoError(null)
    setTableInfo(null)

    try {
      const response = await fetch("/api/table-info")
      const data = await response.json()
      setTableInfo(data)
    } catch (err) {
      setTableInfoError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setTableInfoLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Test the direct connection to your MySQL database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testConnection} disabled={loading}>
              <Database className="mr-2 h-4 w-4" />
              {loading ? "Testing..." : "Test Database Connection"}
            </Button>

            <Button onClick={checkTableInfo} disabled={tableInfoLoading} variant="outline">
              <Info className="mr-2 h-4 w-4" />
              {tableInfoLoading ? "Checking..." : "Check Table Structure"}
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
                    <p>Successfully connected to MySQL database.</p>
                    <p className="text-xs mt-1">Time: {result.time}</p>
                  </div>
                ) : (
                  <div>
                    <p>{result.error || "Unknown error"}</p>
                    {result.stack && (
                      <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                        {result.stack}
                      </pre>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {tableInfo && (
            <Alert variant={tableInfo.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {tableInfo.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>{tableInfo.success ? "Table Info Retrieved" : "Table Info Failed"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {tableInfo.success ? (
                  <div>
                    <div className="mb-2">
                      <p className="font-medium">
                        stats table: {tableInfo.tables.stats.exists ? "Exists ✓" : "Not Found ✗"}
                      </p>
                      {tableInfo.tables.stats.exists && (
                        <p className="text-sm text-muted-foreground">
                          {tableInfo.tables.stats.columns.length} columns found
                        </p>
                      )}
                    </div>
                    <div className="mb-2">
                      <p className="font-medium">
                        projected_contracts table:{" "}
                        {tableInfo.tables.projected_contracts.exists ? "Exists ✓" : "Not Found ✗"}
                      </p>
                      {tableInfo.tables.projected_contracts.exists && (
                        <p className="text-sm text-muted-foreground">
                          {tableInfo.tables.projected_contracts.columns.length} columns found
                        </p>
                      )}
                    </div>
                    <p className="text-xs mt-1">Time: {tableInfo.time}</p>
                  </div>
                ) : (
                  <div>
                    <p>{tableInfo.error || "Unknown error"}</p>
                    {tableInfo.stack && (
                      <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                        {tableInfo.stack}
                      </pre>
                    )}
                  </div>
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

          {tableInfoError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Table Info Error</AlertTitle>
              <AlertDescription>{tableInfoError}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
