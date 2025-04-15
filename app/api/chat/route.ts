import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getAllNotes, getNoteById } from "@/lib/notes"

// Array of models to try in order of preference
const GEMINI_MODELS = [
  "gemini-1.5-flash", // Try flash model first as it has higher quota limits
  "gemini-pro", // Fall back to older models which might have separate quotas
  "gemini-pro-vision",
  "gemini-1.5-pro", // Try the model that hit quota limits last
]

// Parse retry delay from error message
function parseRetryDelay(error: any): number {
  try {
    const message = error.message || error.toString()
    const retryDelayMatch = message.match(/retryDelay":"(\d+)s"/)
    if (retryDelayMatch && retryDelayMatch[1]) {
      return Number.parseInt(retryDelayMatch[1]) * 1000 // Convert to milliseconds
    }
  } catch (e) {
    console.error("Error parsing retry delay:", e)
  }
  return 30000 // Default to 30 seconds if we can't parse
}

// Check if error is a quota exceeded error
function isQuotaExceededError(error: any): boolean {
  const message = error.message || error.toString()
  return message.includes("quota") || message.includes("429") || message.includes("rate limit")
}

export async function POST(request: Request) {
  try {
    const { message, noteId } = await request.json()

    // Check if we have the Google AI API key
    const googleAiApiKey = process.env.GOOGLE_AI_API_KEY

    if (!googleAiApiKey) {
      return NextResponse.json(
        { error: "API key di Google AI non configurata. Aggiungila nelle impostazioni." },
        { status: 500 },
      )
    }

    // Get context based on whether we're analyzing a specific note or all notes
    let context = ""
    let notes = []

    try {
      if (noteId) {
        const note = await getNoteById(noteId)
        if (note) {
          context = `Analizzando la nota intitolata "${note.title}": ${note.content}`
          notes = [note]
        } else {
          return NextResponse.json({ error: "Nota non trovata" }, { status: 404 })
        }
      } else {
        notes = await getAllNotes()
        if (notes.length > 0) {
          context = `Analizzando tutte le note:\n${notes
            .map((note) => `Nota intitolata "${note.title}": ${note.content.substring(0, 100)}...`)
            .join("\n")}`
        } else {
          context = "Nessuna nota trovata da analizzare."
        }
      }
    } catch (error) {
      console.error("Errore nel recupero delle note:", error)
      return NextResponse.json({ error: "Impossibile recuperare i dati delle note" }, { status: 500 })
    }

    // Create prompt with context and user message
    const prompt = `
    Sei un assistente AI per un'app di note chiamata NotionKeep.
    Il tuo compito è analizzare le note e fornire informazioni utili.
    Rispondi sempre in italiano.
    
    ${context}
    
    Domanda dell'utente: ${message}
    
    Fornisci una risposta utile e concisa basata sul contenuto delle note.
    `

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(googleAiApiKey)

    // Try each model in order until one works
    let lastError = null
    const quotaExceededModels = new Set()

    for (let attempt = 0; attempt < 2; attempt++) {
      // Allow up to 2 attempts
      for (const modelName of GEMINI_MODELS) {
        // Skip models that have already hit quota limits
        if (quotaExceededModels.has(modelName)) {
          continue
        }

        try {
          console.log(`Trying model: ${modelName} (attempt ${attempt + 1})`)

          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024, // Reduced from 2048 to help with quota
            },
          })

          // Generate content
          const result = await model.generateContent(prompt)
          const response = result.response.text()

          if (!response || response.trim() === "") {
            throw new Error("Risposta vuota da Google AI")
          }

          console.log(`Successfully generated response with model: ${modelName}`)
          return NextResponse.json({ response })
        } catch (error) {
          console.log(`Error with model ${modelName}:`, error)
          lastError = error

          // If it's a quota exceeded error, mark this model and try another
          if (isQuotaExceededError(error)) {
            console.log(`Quota exceeded for model ${modelName}`)
            quotaExceededModels.add(modelName)

            // If this is the first attempt and all models have hit quota limits, wait and retry
            if (attempt === 0 && quotaExceededModels.size === GEMINI_MODELS.length) {
              const retryDelay = parseRetryDelay(error)
              console.log(`All models hit quota limits. Waiting ${retryDelay}ms before retry...`)
              await new Promise((resolve) => setTimeout(resolve, retryDelay))
              break // Break the inner loop to start the next attempt
            }
          }
        }
      }
    }

    // If we get here, all models failed
    console.error("All models failed:", lastError)

    // Use our fallback response generator
    const fallbackResponse = generateFallbackResponse(message, notes, lastError)
    return NextResponse.json({ response: fallbackResponse })
  } catch (error) {
    console.error("Errore nell'API di chat:", error)
    return NextResponse.json({ error: "Impossibile elaborare la richiesta di chat" }, { status: 500 })
  }
}

// Function to generate a fallback response when all models fail
function generateFallbackResponse(message: string, notes: any[], error: any): string {
  const isQuotaError = error && isQuotaExceededError(error)

  let errorMessage = "Errore sconosciuto"
  if (error) {
    errorMessage = error.message || error.toString()
    // Trim the error message to avoid exposing too much technical detail
    errorMessage = errorMessage.split("\n")[0].substring(0, 100)
  }

  const greeting = "Mi dispiace, "

  if (isQuotaError) {
    return `${greeting}al momento non posso rispondere perché abbiamo raggiunto il limite di richieste all'API di Google AI.

Questo accade perché stiamo utilizzando il piano gratuito di Google AI, che ha limiti sul numero di richieste che possiamo fare.

Puoi riprovare tra qualche minuto quando la quota si sarà resettata.

Nel frattempo, ecco un riassunto delle tue note:
${
  notes.length > 0
    ? `Hai ${notes.length} note. La più recente è intitolata "${notes[0].title}".`
    : "Non hai ancora creato nessuna nota."
}`
  }

  // If it's not a quota error, provide a generic fallback
  const lowercaseMessage = message.toLowerCase()

  // Check if there are no notes
  if (notes.length === 0) {
    return `${greeting}non ci sono ancora note da analizzare. Prova a creare qualche nota prima di chiedere informazioni.`
  }

  // Handle different types of questions
  if (
    lowercaseMessage.includes("riassunto") ||
    lowercaseMessage.includes("riassumi") ||
    lowercaseMessage.includes("sintesi") ||
    lowercaseMessage.includes("sintetizza")
  ) {
    return `${greeting}non posso generare un riassunto dettagliato al momento, ma posso dirti che hai ${notes.length} note, tra cui: ${notes
      .slice(0, 3)
      .map((n) => `"${n.title}"`)
      .join(", ")}${notes.length > 3 ? " e altre." : "."}`
  }

  if (
    lowercaseMessage.includes("quante") ||
    lowercaseMessage.includes("numero") ||
    lowercaseMessage.includes("conta") ||
    lowercaseMessage.includes("totale")
  ) {
    return `${greeting}posso dirti che ci sono ${notes.length} note nella collezione.`
  }

  if (
    lowercaseMessage.includes("recente") ||
    lowercaseMessage.includes("ultima") ||
    lowercaseMessage.includes("nuova") ||
    lowercaseMessage.includes("aggiornata")
  ) {
    const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return `${greeting}non posso analizzare in dettaglio le note al momento, ma posso dirti che la nota più recente è "${sortedNotes[0].title}" aggiornata il ${new Date(sortedNotes[0].updatedAt).toLocaleDateString()}.`
  }

  // Default response
  return `${greeting}non posso analizzare le tue note al momento a causa di un problema tecnico.

Errore: ${errorMessage}

Puoi riprovare più tardi o verificare le impostazioni dell'API key.`
}
