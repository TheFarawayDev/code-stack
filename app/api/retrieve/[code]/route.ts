import { type NextRequest, NextResponse } from "next/server"
import { codeStorage, cleanupExpired } from "@/lib/storage"

function isVercelEnvironment() {
  return process.env.VERCEL === "1" || process.env.VERCEL_ENV || process.env.NODE_ENV === "development"
}

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  if (!isVercelEnvironment()) {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    cleanupExpired()

    const accessCode = params.code
    console.log("[v0] Retrieving code:", accessCode)

    if (!accessCode || accessCode.length !== 12) {
      return NextResponse.json({ error: "Invalid access code format" }, { status: 400 })
    }

    const stored = codeStorage.get(accessCode)

    if (!stored) {
      console.log("[v0] Code not found")
      return NextResponse.json({ error: "Code not found or expired" }, { status: 404 })
    }

    const now = Date.now()
    if (stored.expiresAt < now) {
      console.log("[v0] Code has expired")
      return NextResponse.json({ error: "Code has expired" }, { status: 404 })
    }

    const remainingTime = stored.expiresAt - now
    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000))
    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000))

    console.log("[v0] Code retrieved successfully")

    return NextResponse.json({
      code: stored.code,
      storedAt: new Date(stored.timestamp).toISOString(),
      expiresAt: new Date(stored.expiresAt).toISOString(),
      extended: stored.extended || false,
      teacherId: stored.teacherId,
      remainingTime: `${remainingHours}h ${remainingMinutes}m`,
      message: "Code retrieved successfully",
    })
  } catch (error) {
    console.error("[v0] Error retrieving code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
