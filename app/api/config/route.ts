import { type NextRequest, NextResponse } from "next/server"
import { getConfigValue, setConfigValue } from "@/lib/edge-config-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "Key parameter required" }, { status: 400 })
    }

    const value = await getConfigValue(key)
    return NextResponse.json({ key, value })
  } catch (error) {
    console.log("[v0] Error in config GET:", error)
    return NextResponse.json({ error: "Failed to get config value" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    const success = await setConfigValue(key, value)

    if (success) {
      return NextResponse.json({ message: "Config value set successfully", key, value })
    } else {
      return NextResponse.json({ error: "Failed to set config value" }, { status: 500 })
    }
  } catch (error) {
    console.log("[v0] Error in config POST:", error)
    return NextResponse.json({ error: "Failed to set config value" }, { status: 500 })
  }
}
