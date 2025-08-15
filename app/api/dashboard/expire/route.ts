import { NextResponse } from "next/server"
import { expireCode } from "@/lib/storage"

export async function POST(request: Request) {
  // Only block if explicitly not on Vercel and not in development
  if (process.env.VERCEL !== "1" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "This service only works on Vercel" }, { status: 403 })
  }

  try {
    const { accessCode } = await request.json()
    console.log("[v0] Expiring code:", accessCode)

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json({ error: "Access code is required" }, { status: 400 })
    }

    const success = expireCode(accessCode)

    if (success) {
      console.log("[v0] Code expired successfully")
      return NextResponse.json({ message: "Code expired successfully" })
    } else {
      console.log("[v0] Code not found")
      return NextResponse.json({ error: "Code not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] Error expiring code:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
