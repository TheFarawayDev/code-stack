import { type NextRequest, NextResponse } from "next/server"

function isVercelEnvironment() {
  return process.env.VERCEL === "1" || process.env.VERCEL_ENV
}

// Use global storage to persist between API calls
declare global {
  var codeStorage: Map<string, { code: string; timestamp: number }> | undefined
}

const globalCodeStorage = globalThis.codeStorage ?? new Map<string, { code: string; timestamp: number }>()
globalThis.codeStorage = globalCodeStorage

// Generate a random 12-character access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Clean up expired entries (older than 1 hour)
function cleanupExpired() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [key, value] of globalCodeStorage.entries()) {
    if (value.timestamp < oneHourAgo) {
      globalCodeStorage.delete(key)
    }
  }
}

export async function POST(request: NextRequest) {
  if (!isVercelEnvironment()) {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Code is required and must be a non-empty string" }, { status: 400 })
    }

    cleanupExpired()

    let accessCode: string
    do {
      accessCode = generateAccessCode()
    } while (globalCodeStorage.has(accessCode))

    globalCodeStorage.set(accessCode, {
      code: code.trim(),
      timestamp: Date.now(),
    })

    // Set up automatic deletion after 1 hour
    setTimeout(
      () => {
        globalCodeStorage.delete(accessCode)
      },
      60 * 60 * 1000,
    )

    return NextResponse.json({
      accessCode,
      expiresIn: "1 hour",
      message: "Code stored successfully",
    })
  } catch (error) {
    console.error("Error storing code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
