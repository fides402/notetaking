import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY

    return NextResponse.json({ hasApiKey })
  } catch (error) {
    console.error("Error checking API key:", error)
    return NextResponse.json({ hasApiKey: false }, { status: 500 })
  }
}
