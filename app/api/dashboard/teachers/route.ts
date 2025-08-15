import { NextResponse } from "next/server"

export async function POST(request: Request) {
  return NextResponse.json({ error: "Teacher ID functionality has been removed" }, { status: 404 })
}

export async function DELETE(request: Request) {
  return NextResponse.json({ error: "Teacher ID functionality has been removed" }, { status: 404 })
}
