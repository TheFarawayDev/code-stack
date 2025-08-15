import { type NextRequest, NextResponse } from "next/server"

function isVercelEnvironment() {
  return process.env.VERCEL === "1" || process.env.VERCEL_ENV
}

// Use global storage to persist between API calls
declare global {
  var codeStorage: Map<string, { code: string; timestamp: number; expiresAt: number; extended?: boolean }> | undefined
}

const globalCodeStorage = globalThis.codeStorage ?? new Map()
globalThis.codeStorage = globalCodeStorage

function generateExtensionCode(): string {
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

function isValidExtensionCode(code: string): boolean {
  return code === generateExtensionCode()
}

export async function POST(request: NextRequest) {
  if (!isVercelEnvironment()) {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    const { accessCode, extensionCode } = await request.json()

    if (!accessCode || !extensionCode) {
      return NextResponse.json({ error: "Both accessCode and extensionCode are required" }, { status: 400 })
    }

    // Validate extension code
    if (!isValidExtensionCode(extensionCode)) {
      return NextResponse.json({ error: "Invalid or expired extension code" }, { status: 401 })
    }

    // Check if access code exists
    const storedData = globalCodeStorage.get(accessCode)
    if (!storedData) {
      return NextResponse.json({ error: "Access code not found or expired" }, { status: 404 })
    }

    // Check if already extended
    if (storedData.extended) {
      return NextResponse.json({ error: "This code has already been extended" }, { status: 400 })
    }

    // Extend expiration to 24 hours from now
    const newExpiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    globalCodeStorage.set(accessCode, {
      ...storedData,
      expiresAt: newExpiresAt,
      extended: true,
    })

    return NextResponse.json({
      message: "Code extended successfully",
      accessCode,
      newExpiresIn: "24 hours",
      extendedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error extending code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
