import { NextResponse } from "next/server"
import { getTeacherIds, addTeacherId, removeTeacherId } from "@/lib/storage"

export async function GET() {
  console.log("[v0] Getting teacher IDs")
  try {
    const teacherIds = getTeacherIds()
    console.log("[v0] Teacher IDs retrieved:", teacherIds)
    return NextResponse.json({ teacherIds: Array.from(teacherIds) })
  } catch (error) {
    console.error("[v0] Error getting teacher IDs:", error)
    return NextResponse.json({ error: "Failed to get teacher IDs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log("[v0] POST /api/dashboard/teachers - Starting")
  try {
    const body = await request.text()
    console.log("[v0] Raw request body:", body)

    let parsedBody
    try {
      parsedBody = JSON.parse(body)
      console.log("[v0] Parsed body:", parsedBody)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { teacherId } = parsedBody
    console.log("[v0] Extracted teacherId:", teacherId, "Type:", typeof teacherId)

    if (!teacherId || typeof teacherId !== "string") {
      console.log("[v0] Invalid teacherId - empty or not string")
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 })
    }

    const currentIds = getTeacherIds()
    console.log("[v0] Current teacher IDs before adding:", Array.from(currentIds))
    console.log("[v0] Attempting to add teacherId:", teacherId)

    const success = addTeacherId(teacherId)
    console.log("[v0] addTeacherId result:", success)

    if (success) {
      const teacherIds = getTeacherIds()
      console.log("[v0] Teacher ID added successfully, new IDs:", Array.from(teacherIds))
      console.log("[v0] New count:", teacherIds.size)
      return NextResponse.json({
        success: true,
        teacherIds: Array.from(teacherIds),
        count: teacherIds.size,
      })
    } else {
      console.log("[v0] Teacher ID already exists or failed to add")
      return NextResponse.json({ error: "Teacher ID already exists" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Error in POST /api/dashboard/teachers:", error)
    return NextResponse.json({ error: "Failed to add teacher ID" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  console.log("[v0] Removing teacher ID")
  try {
    const { teacherId } = await request.json()
    console.log("[v0] Removing teacher ID:", teacherId)

    if (!teacherId || typeof teacherId !== "string") {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 })
    }

    const success = removeTeacherId(teacherId)
    if (success) {
      const teacherIds = getTeacherIds()
      console.log("[v0] Teacher ID removed successfully, new count:", teacherIds.size)
      return NextResponse.json({
        success: true,
        teacherIds: Array.from(teacherIds),
        count: teacherIds.size,
      })
    } else {
      return NextResponse.json({ error: "Teacher ID not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[v0] Error removing teacher ID:", error)
    return NextResponse.json({ error: "Failed to remove teacher ID" }, { status: 500 })
  }
}
