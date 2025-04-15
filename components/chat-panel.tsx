"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ChatPanelProps {
  noteId?: string
}

export default function ChatPanel({ noteId }: ChatPanelProps) {
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Add initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: noteId
          ? "Ciao! Posso aiutarti ad analizzare questa nota specifica. Cosa vorresti sapere?"
          : "Ciao! Posso aiutarti ad analizzare tutte le tue note. Cosa vorresti sapere?",
      },
    ])
  }, [noteId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    const userMessage = message.trim()
    setMessage("")
    setError(null)

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          noteId,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore nella risposta")
      }

      // Check if the response contains a rate limit message
      const isRateLimitResponse =
        data.response &&
        (data.response.includes("limite di richieste") ||
          data.response.includes("quota") ||
          data.response.includes("rate limit"))

      if (isRateLimitResponse) {
        setIsRateLimited(true)
      }

      // Add assistant message to chat
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error in chat:", error)

      // Check if it's a rate limit error
      const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto"
      const isRateLimitError =
        errorMessage.toLowerCase().includes("quota") ||
        errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("429")

      if (isRateLimitError) {
        setIsRateLimited(true)
      }

      // Set error state
      const displayErrorMessage =
        error instanceof Error
          ? error.name === "AbortError"
            ? "La richiesta è scaduta. Verifica la tua connessione internet e riprova."
            : error.message
          : "Impossibile ottenere una risposta. Riprova."

      setError(displayErrorMessage)

      // Add error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Mi dispiace, ho riscontrato un errore nell'elaborazione della tua richiesta. Riprova più tardi o controlla le impostazioni dell'API key.",
        },
      ])

      toast({
        title: "Errore",
        description: displayErrorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium">Assistente AI</h3>
        <p className="text-xs text-muted-foreground">
          {noteId ? "Fai domande su questa nota" : "Fai domande su tutte le tue note"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {isRateLimited && (
          <Alert className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Stiamo utilizzando il piano gratuito di Google AI, che ha limiti sul numero di richieste. Se ricevi errori
              di quota, attendi qualche minuto prima di riprovare.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>Chiedimi qualsiasi cosa sulle tue {noteId ? "nota" : "note"}!</p>
            <p className="text-xs mt-2">Powered by Google AI</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Fai una domanda..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            className="focus-visible:ring-2"
          />
          <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
