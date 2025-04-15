import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Array of models to check
const GEMINI_MODELS = [
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-pro-vision",
  "gemini-1.0-pro",
  "gemini-1.0-pro-latest",
]

export async function GET() {
  try {
    const googleAiApiKey = process.env.GOOGLE_AI_API_KEY

    if (!googleAiApiKey) {
      return NextResponse.json({ error: "API key di Google AI non configurata" }, { status: 500 })
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(googleAiApiKey)

    // Check which models are available by trying to initialize each one
    const availableModels = []
    const unavailableModels = []

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })

        // Test if the model works by generating a simple response
        await model.generateContent("Test")

        availableModels.push({
          name: modelName,
          status: "available",
        })
      } catch (error) {
        unavailableModels.push({
          name: modelName,
          status: "unavailable",
          error: error instanceof Error ? error.message : "Errore sconosciuto",
        })
      }
    }

    return NextResponse.json({
      available: availableModels,
      unavailable: unavailableModels,
    })
  } catch (error) {
    console.error("Error in models API:", error)
    return NextResponse.json({ error: "Errore nella richiesta API" }, { status: 500 })
  }
}
