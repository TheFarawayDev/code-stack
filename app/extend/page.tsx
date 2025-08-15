"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExtendPage() {
  const [currentCode, setCurrentCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [accessCode, setAccessCode] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Generate extension code based on current minute
  const generateExtensionCode = () => {
    const now = new Date()
    const minute = now.getMinutes()
    const hour = now.getHours()
    const day = now.getDate()
    const month = now.getMonth()

    const seed = `${month}${day}${hour}${minute}`

    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    const code = Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8)
    return code
  }

  // Update code and countdown every second
  useEffect(() => {
    const updateCode = () => {
      const now = new Date()
      const secondsLeft = 60 - now.getSeconds()
      setTimeLeft(secondsLeft)
      setCurrentCode(generateExtensionCode())
    }

    updateCode() // Initial update
    const interval = setInterval(updateCode, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleExtend = async () => {
    if (!accessCode.trim()) {
      setMessage("Please enter an access code")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/extend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode: accessCode.trim(),
          extensionCode: currentCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message}`)
        setAccessCode("")
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage("❌ Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(currentCode)
    setMessage("📋 Extension code copied to clipboard")
    setTimeout(() => setMessage(""), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Code Extension Portal</h1>
          <p className="text-gray-600">Extend stored code expiration from 1 hour to 24 hours</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🔑 Current Extension Code</CardTitle>
            <CardDescription>This code changes every minute and only works during its active minute</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-600 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                {currentCode}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Expires in: <span className="font-semibold text-red-600">{timeLeft}s</span>
              </div>
            </div>
            <Button onClick={copyCode} variant="outline" className="w-full bg-transparent">
              📋 Copy Extension Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extend Code Expiration</CardTitle>
            <CardDescription>Enter the 12-character access code you want to extend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter 12-character access code"
                maxLength={12}
              />
            </div>
            <Button onClick={handleExtend} disabled={isLoading || !accessCode.trim()} className="w-full">
              {isLoading ? "Extending..." : "🚀 Extend to 24 Hours"}
            </Button>
            {message && <div className="p-3 rounded-lg bg-gray-50 border text-sm">{message}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Extension codes change every minute for security</p>
            <p>• Each access code can only be extended once</p>
            <p>• Extended codes last 24 hours from extension time</p>
            <p>• You must use the current extension code within its active minute</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
