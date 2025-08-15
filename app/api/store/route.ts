import { type NextRequest, NextResponse } from "next/server"
import { codeStorage, generateAccessCode, cleanupExpired, storeCode } from "@/lib/storage"

function isVercelEnvironment() {
  return process.env.VERCEL === "1" || process.env.VERCEL_ENV || process.env.NODE_ENV === "development"
}

export async function POST(request: NextRequest) {
  if (!isVercelEnvironment()) {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    const { code } = await request.json()
    console.log("[v0] Storing code")

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Code is required and must be a non-empty string" }, { status: 400 })
    }

    await cleanupExpired()

    let accessCode: string
    do {
      accessCode = generateAccessCode()
    } while (codeStorage.has(accessCode))

    const now = Date.now()
    const expirationTime = 60 * 60 * 1000 // 1 hour
    const expiresAt = now + expirationTime

    await storeCode(accessCode, {
      code: code.trim(),
      timestamp: now,
      expiresAt: expiresAt,
    })

    // Set up automatic deletion
    setTimeout(() => {
      codeStorage.delete(accessCode)
    }, expirationTime)

    console.log("[v0] Code stored successfully:", accessCode)

    return NextResponse.json({
      accessCode,
      expiresIn: "1 hour",
      message: "Code stored successfully",
    })
  } catch (error) {
    console.error("[v0] Error storing code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
