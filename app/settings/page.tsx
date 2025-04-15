"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false)
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [unavailableModels, setUnavailableModels] = useState<any[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

  // Check if API key is set in environment variables
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/check-api-key")
        const data = await response.json()
        setHasEnvApiKey(data.hasApiKey)

        if (data.hasApiKey) {
          fetchAvailableModels()
        }
      } catch (error) {
        console.error("Error checking API key:", error)
      }
    }

    checkApiKey()
  }, [])

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("googleAiApiKey") || ""
    setApiKey(savedApiKey)
  }, [])

  const fetchAvailableModels = async () => {
    setIsLoadingModels(true)
    setModelError(null)

    try {
      const response = await fetch("/api/models")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Impossibile ottenere i modelli disponibili")
      }

      setAvailableModels(data.available || [])
      setUnavailableModels(data.unavailable || [])

      if (data.available && data.available.length > 0) {
        toast({
          title: "Modelli disponibili",
          description: `Trovati ${data.available.length} modelli disponibili.`,
        })
      } else {
        toast({
          title: "Nessun modello disponibile",
          description: "Non è stato trovato nessun modello disponibile con questa API key.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      setModelError(error instanceof Error ? error.message : "Errore sconosciuto")

      toast({
        title: "Errore",
        description: "Impossibile verificare i modelli disponibili.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleSaveApiKey = () => {
    setIsSaving(true)

    try {
      // Save to localStorage
      localStorage.setItem("googleAiApiKey", apiKey)

      toast({
        title: "Impostazioni salvate",
        description: "La tua API key è stata salvata con successo.",
      })

      // Try to fetch available models with the new API key
      fetchAvailableModels()
    } catch (error) {
      console.error("Error saving API key:", error)
      toast({
        title: "Errore",
        description: "Impossibile salvare l'API key. Riprova.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Impostazioni</h1>

        {hasEnvApiKey && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Informazione</AlertTitle>
            <AlertDescription>
              L'API key di Google AI è già configurata nelle variabili d'ambiente del progetto. Non è necessario
              inserirla qui.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Google AI API Key</CardTitle>
            <CardDescription>
              Inserisci la tua API key di Google AI per abilitare l'assistente AI. Puoi ottenere un'API key dal sito di
              Google AI Studio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Inserisci la tua API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={hasEnvApiKey}
              />
              {hasEnvApiKey && (
                <p className="text-sm text-muted-foreground">
                  L'API key è già configurata nelle variabili d'ambiente del progetto.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSaveApiKey} disabled={isSaving || hasEnvApiKey}>
              {isSaving ? "Salvataggio..." : "Salva Impostazioni"}
            </Button>

            <Button
              variant="outline"
              onClick={fetchAvailableModels}
              disabled={isLoadingModels || (!hasEnvApiKey && !apiKey)}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingModels ? "animate-spin" : ""}`} />
              Verifica Modelli Disponibili
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modelli Disponibili</CardTitle>
            <CardDescription>Questi sono i modelli disponibili con la tua API key.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingModels ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Verifica dei modelli in corso...</span>
              </div>
            ) : modelError ? (
              <Alert variant="destructive">
                <AlertTitle>Errore</AlertTitle>
                <AlertDescription>{modelError}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {availableModels.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      Modelli disponibili
                    </h3>
                    <ul className="space-y-2">
                      {availableModels.map((model, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            {model.name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nessun modello disponibile trovato.</p>
                )}

                {unavailableModels.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      Modelli non disponibili
                    </h3>
                    <ul className="space-y-2">
                      {unavailableModels.map((model, index) => (
                        <li key={index} className="text-sm">
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">
                            {model.name}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {availableModels.length === 0 && unavailableModels.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Clicca su "Verifica Modelli Disponibili" per controllare quali modelli puoi utilizzare.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informazioni su NotionKeep</CardTitle>
            <CardDescription>
              NotionKeep è un'app moderna per prendere appunti ispirata a Notion e Google Keep.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Versione 1.0.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
