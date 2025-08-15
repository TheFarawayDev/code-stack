"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeEntry {
  accessCode: string
  code: string
  timestamp: number
  expiresAt: number
  expired?: boolean
}

export default function DashboardPage() {
  const [activeCodes, setActiveCodes] = useState<CodeEntry[]>([])
  const [expiredCodes, setExpiredCodes] = useState<CodeEntry[]>([])
  const [dashboardKey, setDashboardKey] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const authenticate = async () => {
    if (dashboardKey === "BACKDOOR2024") {
      setAuthenticated(true)
      loadDashboardData()
      toast({ title: "Success", description: "Dashboard access granted" })
    } else {
      toast({ title: "Error", description: "Invalid dashboard key" })
    }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading dashboard data")
      const response = await fetch("/api/dashboard")
      console.log("[v0] Dashboard response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Dashboard data:", data)
        setActiveCodes(data.activeCodes || [])
        setExpiredCodes(data.expiredCodes || [])
        toast({ title: "Success", description: "Dashboard data loaded" })
      } else {
        const errorData = await response.json()
        console.log("[v0] Dashboard error:", errorData)
        toast({ title: "Error", description: "Failed to load dashboard data" })
      }
    } catch (error) {
      console.error("[v0] Dashboard load error:", error)
      toast({ title: "Error", description: "Failed to load dashboard data" })
    } finally {
      setLoading(false)
    }
  }

  const expireCode = async (accessCode: string) => {
    try {
      console.log("[v0] Expiring code:", accessCode)
      const response = await fetch("/api/dashboard/expire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode }),
      })

      console.log("[v0] Expire response status:", response.status)
      if (response.ok) {
        loadDashboardData()
        toast({ title: "Success", description: "Code expired successfully" })
      } else {
        const errorData = await response.json()
        console.log("[v0] Expire error:", errorData)
        toast({ title: "Error", description: "Failed to expire code" })
      }
    } catch (error) {
      console.error("[v0] Expire error:", error)
      toast({ title: "Error", description: "Failed to expire code" })
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now()
    if (remaining <= 0) return "Expired"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Dashboard Access</CardTitle>
            <CardDescription>Enter the dashboard key to access admin controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter dashboard key"
              value={dashboardKey}
              onChange={(e) => setDashboardKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && authenticate()}
            />
            <Button onClick={authenticate} className="w-full">
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage active and expired codes</p>
          </div>
          <Button onClick={loadDashboardData} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Codes ({activeCodes.length})</TabsTrigger>
            <TabsTrigger value="expired">Expired Codes ({expiredCodes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {activeCodes.map((entry) => (
                <Card key={entry.accessCode}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-lg font-mono font-bold">{entry.accessCode}</code>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {formatTime(entry.timestamp)}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeRemaining(entry.expiresAt)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Code length: {entry.code.length} characters</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => expireCode(entry.accessCode)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeCodes.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">No active codes</CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            <div className="grid gap-4">
              {expiredCodes.map((entry) => (
                <Card key={entry.accessCode} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold">{entry.accessCode}</code>
                        <Badge variant="destructive">Expired</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {formatTime(entry.timestamp)}</span>
                        <span>Expired: {formatTime(entry.expiresAt)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Code length: {entry.code.length} characters</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {expiredCodes.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No expired codes in history
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
