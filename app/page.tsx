"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CodeStoragePage() {
  const [code, setCode] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [retrievedCode, setRetrievedCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const storeCode = async () => {
    if (!code.trim()) {
      toast({ title: "Error", description: "Please enter some code to store" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })

      if (!response.ok) throw new Error("Failed to store code")

      const data = await response.json()
      setAccessCode(data.accessCode)
      toast({ title: "Success", description: "Code stored successfully!" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to store code" })
    } finally {
      setLoading(false)
    }
  }

  const retrieveCode = async () => {
    if (!accessCode.trim()) {
      toast({ title: "Error", description: "Please enter an access code" })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/retrieve/${accessCode.trim()}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Code not found or expired")
        }
        throw new Error("Failed to retrieve code")
      }

      const data = await response.json()
      setRetrievedCode(data.code)
      toast({ title: "Success", description: "Code retrieved successfully!" })
    } catch (error) {
      toast({ title: "Error", description: error.message })
      setRetrievedCode("")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Copied to clipboard!" })
  }

  const downloadCode = () => {
    const blob = new Blob([retrievedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "retrieved_code.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Code Stack</h1>
          <p className="text-muted-foreground">
            Store and retrieve code snippets with temporary 12-character access codes
          </p>
        </div>

        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store">Store Code</TabsTrigger>
            <TabsTrigger value="retrieve">Retrieve Code</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Store Code</CardTitle>
                <CardDescription>
                  Paste your code below to get a 12-character access code. Code expires in 1 hour.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[200px] font-mono"
                />
                <Button onClick={storeCode} disabled={loading} className="w-full">
                  {loading ? "Storing..." : "Store Code"}
                </Button>

                {accessCode && (
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Access Code Generated:
                          </p>
                          <p className="text-lg font-mono font-bold text-green-900 dark:text-green-100">{accessCode}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(accessCode)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retrieve" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Retrieve Code</CardTitle>
                <CardDescription>Enter the 12-character access code to retrieve stored code.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 12-character access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    maxLength={12}
                    className="font-mono"
                  />
                  <Button onClick={retrieveCode} disabled={loading}>
                    {loading ? "Retrieving..." : "Retrieve"}
                  </Button>
                </div>

                {retrievedCode && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Retrieved Code</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(retrievedCode)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadCode}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={retrievedCode} readOnly className="min-h-[200px] font-mono" />
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
