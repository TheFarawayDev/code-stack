import { type NextRequest, NextResponse } from "next/server"

function isVercelEnvironment() {
  return process.env.VERCEL === "1" || process.env.VERCEL_ENV
}

declare global {
  var codeStorage: Map<string, { code: string; timestamp: number }> | undefined
}

const globalCodeStorage = globalThis.codeStorage ?? new Map<string, { code: string; timestamp: number }>()
globalThis.codeStorage = globalCodeStorage

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  if (!isVercelEnvironment()) {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    const accessCode = params.code

    if (!accessCode || accessCode.length !== 12) {
      return NextResponse.json({ error: "Invalid access code format" }, { status: 400 })
    }

    const stored = globalCodeStorage.get(accessCode)

    if (!stored) {
      return NextResponse.json({ error: "Code not found or expired" }, { status: 404 })
    }

    const oneHourAgo = Date.now() - 60 * 60 * 1000
    if (stored.timestamp < oneHourAgo) {
      globalCodeStorage.delete(accessCode)
      return NextResponse.json({ error: "Code has expired" }, { status: 404 })
    }

    return NextResponse.json({
      code: stored.code,
      storedAt: new Date(stored.timestamp).toISOString(),
      message: "Code retrieved successfully",
    })
  } catch (error) {
    console.error("Error retrieving code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
