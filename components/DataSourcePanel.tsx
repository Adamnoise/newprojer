"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, FileUp, Database, Globe, Trash, RefreshCw } from "lucide-react"
import type { DataSource } from "../analysis/types"

interface DataSourcePanelProps {
  dataSources: DataSource[]
  onAddDataSource: (dataSource: DataSource) => void
  onImportData: (dataSource: DataSource) => void
  isLoading: boolean
  matchCount: number
}

export function DataSourcePanel({
  dataSources,
  onAddDataSource,
  onImportData,
  isLoading,
  matchCount,
}: DataSourcePanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newDataSource, setNewDataSource] = useState<Partial<DataSource>>({
    name: "",
    type: "csv",
    config: {},
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset new data source form
  const resetNewDataSourceForm = () => {
    setNewDataSource({
      name: "",
      type: "csv",
      config: {},
    })
  }

  // Handle adding a new data source
  const handleAddDataSource = () => {
    if (!newDataSource.name || !newDataSource.type) return

    const dataSource: DataSource = {
      id: `datasource-${Date.now()}`,
      name: newDataSource.name,
      type: newDataSource.type as "csv" | "database" | "api",
      config: newDataSource.config || {},
    }

    onAddDataSource(dataSource)
    setIsAddDialogOpen(false)
    resetNewDataSourceForm()
  }

  // Handle file selection for CSV data source
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setNewDataSource((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(".csv", ""),
      config: {
        ...prev.config,
        file,
      },
    }))
  }

  // Handle import data from a data source
  const handleImportData = (dataSource: DataSource) => {
    onImportData(dataSource)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Data Sources</h2>
          <p className="text-gray-400">{matchCount} matches loaded</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0f14] border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Data Source</DialogTitle>
              <DialogDescription>Configure a new source for match data</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="datasource-name">Data Source Name</Label>
                <Input
                  id="datasource-name"
                  value={newDataSource.name || ""}
                  onChange={(e) => setNewDataSource((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premier League 2023-24"
                  className="bg-black/30 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="datasource-type">Source Type</Label>
                <Select
                  value={newDataSource.type}
                  onValueChange={(value) => setNewDataSource((prev) => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger id="datasource-type" className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f14] border-white/10">
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newDataSource.type === "csv" && (
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <FileUp className="w-4 h-4" />
                      Choose File
                    </Button>
                    <span className="text-sm text-gray-400">
                      {newDataSource.config?.file ? (newDataSource.config.file as File).name : "No file chosen"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    CSV should contain columns: date, home_team, away_team, ht_home_score, ht_away_score, home_score,
                    away_score
                  </p>
                </div>
              )}

              {newDataSource.type === "database" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="db-host">Host</Label>
                    <Input
                      id="db-host"
                      value={newDataSource.config?.host || ""}
                      onChange={(e) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, host: e.target.value },
                        }))
                      }
                      placeholder="e.g., localhost"
                      className="bg-black/30 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-port">Port</Label>
                    <Input
                      id="db-port"
                      value={newDataSource.config?.port || ""}
                      onChange={(e) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, port: e.target.value },
                        }))
                      }
                      placeholder="e.g., 5432"
                      className="bg-black/30 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-name">Database Name</Label>
                    <Input
                      id="db-name"
                      value={newDataSource.config?.database || ""}
                      onChange={(e) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, database: e.target.value },
                        }))
                      }
                      placeholder="e.g., soccer_data"
                      className="bg-black/30 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-user">Username</Label>
                    <Input
                      id="db-user"
                      value={newDataSource.config?.username || ""}
                      onChange={(e) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, username: e.target.value },
                        }))
                      }
                      placeholder="e.g., postgres"
                      className="bg-black/30 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="db-password">Password</Label>
                    <Input
                      id="db-password"
                      type="password"
                      value={newDataSource.config?.password || ""}
                      onChange={(e) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, password: e.target.value },
                        }))
                      }
                      placeholder="Enter password"
                      className="bg-black/30 border-white/10"
                    />
                  </div>
                </div>
              )}

              {newDataSource.type === "api" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-url">API URL</Label>
                    <Input
                      id="api-url"
                      value={newDataSource.config?.url || ""}
                      onChange={(e) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, url: e.target.value },
                        }))
                      }
                      placeholder="e.g., https://api.example.com/matches"
                      className="bg-black/30 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-method">Method</Label>
                    <Select
                      value={newDataSource.config?.method || "GET"}
                      onValueChange={(value) =>
                        setNewDataSource((prev) => ({
                          ...prev,
                          config: { ...prev.config, method: value },
                        }))
                      }
                    >
                      <SelectTrigger id="api-method" className="bg-black/30 border-white/10">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f14] border-white/10">
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-headers">Headers (JSON)</Label>
                    <Input
                      id="api-headers"
                      value={newDataSource.config?.headersJson || ""}
                      onChange={(e) => {
                        try {
                          const headers = e.target.value ? JSON.parse(e.target.value) : {}
                          setNewDataSource((prev) => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              headers,
                              headersJson: e.target.value,
                            },
                          }))
                        } catch (error) {
                          // Handle invalid JSON
                          setNewDataSource((prev) => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              headersJson: e.target.value,
                            },
                          }))
                        }
                      }}
                      placeholder='e.g., {"Authorization": "Bearer token"}'
                      className="bg-black/30 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-body">Body (JSON)</Label>
                    <Input
                      id="api-body"
                      value={newDataSource.config?.bodyJson || ""}
                      onChange={(e) => {
                        try {
                          const body = e.target.value ? JSON.parse(e.target.value) : {}
                          setNewDataSource((prev) => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              body,
                              bodyJson: e.target.value,
                            },
                          }))
                        } catch (error) {
                          // Handle invalid JSON
                          setNewDataSource((prev) => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              bodyJson: e.target.value,
                            },
                          }))
                        }
                      }}
                      placeholder='e.g., {"league": "premier-league"}'
                      className="bg-black/30 border-white/10"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDataSource}
                disabled={!newDataSource.name || (newDataSource.type === "csv" && !newDataSource.config?.file)}
              >
                Add Data Source
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {dataSources.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2">No Data Sources Configured</h3>
          <p className="text-gray-400 mb-4">Add a data source to import match data for analysis</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Data Source
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataSources.map((dataSource) => (
            <Card key={dataSource.id} className="bg-black/20 border border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {dataSource.type === "csv" && <FileUp className="w-4 h-4" />}
                  {dataSource.type === "database" && <Database className="w-4 h-4" />}
                  {dataSource.type === "api" && <Globe className="w-4 h-4" />}
                  {dataSource.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-400">
                  <p>Type: {dataSource.type.toUpperCase()}</p>
                  {dataSource.type === "csv" && dataSource.config.file && (
                    <p>File: {(dataSource.config.file as File).name}</p>
                  )}
                  {dataSource.type === "database" && (
                    <p>
                      Database: {dataSource.config.database} @ {dataSource.config.host}
                    </p>
                  )}
                  {dataSource.type === "api" && <p>URL: {dataSource.config.url}</p>}
                  {dataSource.lastSynced && (
                    <p className="mt-2">Last synced: {new Date(dataSource.lastSynced).toLocaleString()}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImportData(dataSource)}
                  disabled={isLoading}
                  className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  Import Data
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                  <Trash className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

