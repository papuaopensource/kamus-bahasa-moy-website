"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ArrowLeftRight, Volume2, Clipboard, Check, Sparkles, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import dictionaryData from "@/data/dictionary.json"

// Function to debounce input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Helper function to get category color
const getCategoryColor = (category: string) => {
  switch (category) {
    case "nomina":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "verba":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "adjektiva":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "pronomina":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "adverbia":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    case "numeralia":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "frasa":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  return <Sparkles className="h-3.5 w-3.5" />
}

// Extract unique categories - dengan penanganan null/undefined
const categories = Array.from(
  new Set(
    dictionaryData
      .filter((word) => word?.word_class_id?.name) // Filter out entries with missing word_class_id or name
      .map((word) => word.word_class_id.name),
  ),
).map((name) => {
  const word = dictionaryData.find((w) => w?.word_class_id?.name === name)
  return {
    id: name,
    name: `${String(name).charAt(0).toUpperCase() + String(name).slice(1)} (${word?.word_class_id?.abbreviation || ""})`,
  }
})

export default function KamusApp() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isReversed, setIsReversed] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [currentWordDetails, setCurrentWordDetails] = useState<any>(null)
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([])
  const [showAutoComplete, setShowAutoComplete] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [wordDetailsOpen, setWordDetailsOpen] = useState(false)
  const [relatedWords, setRelatedWords] = useState<string[]>([])
  const [selectedRelatedWord, setSelectedRelatedWord] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const relatedWordsRef = useRef<HTMLDivElement>(null)

  // Debounce input text for auto-translation
  const debouncedInputText = useDebounce(inputText, 500)

  // Auto-translate when input text changes (debounced)
  useEffect(() => {
    if (debouncedInputText) {
      performTranslation(debouncedInputText)
    } else {
      setTranslatedText("")
      setCurrentWordDetails(null)
      setRelatedWords([])
    }
  }, [debouncedInputText, isReversed])

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  // Function to get related words by IDs
  const getRelatedWords = (relatedIds: number[] | null | undefined, showMoyWords: boolean) => {
    if (!relatedIds || relatedIds.length === 0) return []
    return relatedIds
      .map((id) => {
        const word = dictionaryData.find((w) => w.id === id)
        return word ? (showMoyWords ? word.text : word.meanings?.[0]?.name || "") : ""
      })
      .filter(Boolean)
  }

  // Function to get all meanings as a string
  const getMeaningsAsString = (meanings: Array<{ id: number; name: string }> | null | undefined) => {
    if (!meanings || meanings.length === 0) return "Tidak ada arti"
    return meanings.map((meaning) => meaning.name).join(", ")
  }

  // Perbaikan fungsi performTranslation untuk menangani kata majemuk dengan benar
  // Function to translate text
  const performTranslation = useCallback(
    (text: string) => {
      let result = ""
      const foundWords: any[] = []

      if (isReversed) {
        // Moy to Indonesia
        // Coba cari frasa lengkap terlebih dahulu
        const moyPhrase = text.toLowerCase().trim()
        const foundPhrase = dictionaryData.find((item) => item.text?.toLowerCase() === moyPhrase)

        if (foundPhrase) {
          // Jika frasa lengkap ditemukan
          result = foundPhrase.meanings?.[0]?.name || "Tidak ada terjemahan"
          foundWords.push(foundPhrase)
        } else {
          // Jika tidak, coba terjemahkan kata per kata
          const words = text.toLowerCase().split(/\s+/)
          words.forEach((word) => {
            const found = dictionaryData.find((item) => item.text?.toLowerCase() === word.toLowerCase())
            if (found) {
              result += (found.meanings?.[0]?.name || "Tidak ada terjemahan") + " "
              foundWords.push(found)
            } else {
              result += word + " "
            }
          })
        }
      } else {
        // Indonesia to Moy
        // Coba cari frasa lengkap terlebih dahulu
        const indoPhrase = text.toLowerCase().trim()
        const foundPhrase = dictionaryData.find((item) =>
          item.meanings?.some((meaning: { name: string }) => meaning.name?.toLowerCase() === indoPhrase),
        )

        if (foundPhrase) {
          // Jika frasa lengkap ditemukan
          result = foundPhrase.text || "Tidak ada terjemahan"
          foundWords.push(foundPhrase)
        } else {
          // Jika tidak, coba terjemahkan kata per kata
          const words = text.toLowerCase().split(/\s+/)
          words.forEach((word) => {
            const found = dictionaryData.find((item) =>
              item.meanings?.some((meaning: { name: string }) => meaning.name?.toLowerCase() === word.toLowerCase()),
            )
            if (found) {
              result += (found.text || "Tidak ada terjemahan") + " "
              foundWords.push(found)
            } else {
              result += word + " "
            }
          })
        }
      }

      setTranslatedText(result.trim())

      // Set current word details and related words if a single word was found
      if (foundWords.length === 1) {
        setCurrentWordDetails(foundWords[0])
        // Get related words - tampilkan kata Moy jika arah terjemahan dari Indonesia ke Moy
        const relatedWordTexts = getRelatedWords(foundWords[0].related_words, isReversed)
        setRelatedWords(relatedWordTexts)
      } else {
        setCurrentWordDetails(null)
        setRelatedWords([])
      }
    },
    [isReversed],
  )

  // Function to swap languages
  const swapLanguages = () => {
    setIsReversed(!isReversed)
    setInputText(translatedText)
    setTranslatedText(inputText)
    setCurrentWordDetails(null)
    setRelatedWords([])
  }

  // Function to handle feedback submission
  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      toast({
        title: "Terima kasih atas saran Anda!",
        description: "Saran Anda telah dikirim dan akan kami tinjau.",
      })
      setFeedbackText("")
      setFeedbackDialogOpen(false)
    } else {
      toast({
        title: "Saran kosong",
        description: "Silakan masukkan saran Anda",
        variant: "destructive",
      })
    }
  }

  // Function to speak text using browser's speech synthesis
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "id-ID" // Indonesian language
      window.speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "Fitur tidak didukung",
        description: "Browser Anda tidak mendukung fitur text-to-speech",
        variant: "destructive",
      })
    }
  }

  // Function to generate autocomplete suggestions
  const generateAutoCompleteSuggestions = (text: string) => {
    if (!text.trim()) {
      setShowAutoComplete(false)
      return
    }

    const searchTerm = text.toLowerCase().trim()
    const lastWord = searchTerm.split(/\s+/).pop() || ""

    if (lastWord.length < 1) {
      setShowAutoComplete(false)
      return
    }

    // Check if the word is already in the dictionary
    const exactMatch = dictionaryData.some((word) => {
      const searchField = isReversed
        ? word.text?.toLowerCase() === lastWord
        : word.meanings?.some((m: { name: string }) => m.name?.toLowerCase() === lastWord)
      return searchField
    })

    // If the word is already in the dictionary, don't show suggestions
    if (exactMatch) {
      setShowAutoComplete(false)
      return
    }

    // Word suggestions
    const wordSuggestions = dictionaryData
      .filter((word) => {
        const searchField = isReversed
          ? word.text?.toLowerCase()?.startsWith(lastWord)
          : word.meanings?.some((m: { name: string }) => m.name?.toLowerCase()?.startsWith(lastWord))
        return searchField
      })
      .map((word) => (isReversed ? word.text : word.meanings?.[0]?.name || ""))
      .filter(Boolean) // Filter out empty strings

    // Phrase suggestions
    const phraseSuggestions = []
    if (lastWord === "apa") {
      phraseSuggestions.push("apa kabar", "apa kabar hari ini")
    } else if (lastWord === "selamat") {
      phraseSuggestions.push("selamat pagi", "selamat siang", "selamat malam")
    } else if (lastWord === "terima") {
      phraseSuggestions.push("terima kasih", "terima kasih banyak")
    }

    // Combine and limit suggestions
    const allSuggestions = [...wordSuggestions, ...phraseSuggestions].slice(0, 5)
    setAutoCompleteSuggestions(allSuggestions)
    setShowAutoComplete(allSuggestions.length > 0)
  }

  // Function to apply auto-complete suggestion
  const applySuggestion = (suggestion: string) => {
    const words = inputText.toLowerCase().split(/\s+/)
    words.pop() // Remove the last word
    words.push(suggestion) // Add the suggestion
    setInputText(words.join(" "))
    setShowAutoComplete(false)

    // Focus back on the input after selecting a suggestion
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Function to copy translated text
  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText)
      setIsCopied(true)
      toast({
        title: "Teks disalin!",
        description: "Terjemahan telah disalin ke clipboard.",
      })
    }
  }

  // Function to show word details
  const showWordDetails = (word: any) => {
    setCurrentWordDetails(word)
    setWordDetailsOpen(true)
  }

  useEffect(() => {
    if (selectedRelatedWord) {
      setInputText(selectedRelatedWord)
      setSelectedRelatedWord(null)
    }
  }, [selectedRelatedWord])

  return (
      <>
        <div className="max-w-screen-xl mx-auto py-8 md:px-8 md:py-12">
          <div className="grid grid-cols-1 gap-6">
            {/* Language selector tabs */}
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-start">
                <div className="px-4 py-2 font-medium border-b-2 border-primary text-primary">
                  {isReversed ? "Moy" : "Indonesia"}
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={swapLanguages} className="mx-2">
                <ArrowLeftRight className="h-5 w-5" />
              </Button>

              <div className="flex-1 flex justify-start">
                <div className="px-4 py-2 font-medium border-b-2 border-primary text-primary">
                  {isReversed ? "Indonesia" : "Moy"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input area */}
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  placeholder="Masukan teks"
                  className="min-h-[200px] resize-none p-4 rounded-md border focus-visible:ring-1 focus-visible:ring-primary"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    generateAutoCompleteSuggestions(e.target.value)
                  }}
                  onFocus={() => generateAutoCompleteSuggestions(inputText)}
                  maxLength={5000}
                />

                {/* Autocomplete suggestions */}
                {showAutoComplete && autoCompleteSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-10"
                  >
                    <ScrollArea className="max-h-[200px]">
                      {autoCompleteSuggestions.map((suggestion, index) => {
                        const matchWord = dictionaryData.find((w) =>
                          isReversed
                            ? w.meanings?.some((m: { name: string }) => m.name === suggestion)
                            : w.text?.toLowerCase() === suggestion.toLowerCase(),
                        )

                        return (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-muted cursor-pointer"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{suggestion}</span>
                              {matchWord && (
                                <span className="text-xs text-muted-foreground">
                                  {isReversed ? matchWord.text : matchWord.meanings?.[0]?.name || ""}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </ScrollArea>
                  </div>
                )}
              </div>

              {/* Output area */}
              <div className="relative min-h-[200px] bg-muted/30 rounded-md p-4">
                {translatedText ? (
                  <div>
                    <p className="text-lg">{translatedText}</p>

                    {currentWordDetails && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs flex items-center gap-1 ${getCategoryColor(currentWordDetails.word_class_id?.name || "")}`}
                          >
                            {getCategoryIcon(currentWordDetails.word_class_id?.name || "")}
                            <span className="truncate max-w-[80px]">
                              {currentWordDetails.word_class_id?.name || "Tidak ada kategori"}
                            </span>
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setWordDetailsOpen(true)}
                          >
                            <Info className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                        </div>

                        {currentWordDetails.example_original && (
                          <div className="text-sm border-l-2 border-muted-foreground/20 pl-3 mt-2">
                            <p className="text-muted-foreground">{currentWordDetails.example_original}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {currentWordDetails.example_translation || "Tidak ada terjemahan"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">Terjemahan</div>
                )}

                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {translatedText && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => speakText(translatedText)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={copyToClipboard}>
                        {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Related words section */}
            {relatedWords.length > 0 && (
              <div ref={relatedWordsRef} className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Terjemahan Lainnya
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedWords.map((word, index) => {
                    // Find word data in dictionary based on translation direction
                    const wordData = !isReversed
                      ? dictionaryData.find((w) => w.text?.toLowerCase() === word.toLowerCase())
                      : dictionaryData.find((w) =>
                          w.meanings?.some((m: { name: string }) => m.name?.toLowerCase() === word.toLowerCase()),
                        )

                    return (
                      <div
                        key={index}
                        className={`group relative px-3 py-2 rounded-full border ${
                          wordData && wordData.word_class_id?.name
                            ? getCategoryColor(wordData.word_class_id.name).split(" ")[0]
                            : "bg-muted"
                        } hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => setSelectedRelatedWord(word)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{word}</span>
                          {wordData && (
                            <Badge variant="outline" className="text-xs bg-white/80 dark:bg-black/30">
                              {isReversed ? wordData.text : wordData.meanings?.[0]?.name || ""}
                            </Badge>
                          )}
                          {wordData && (
                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  showWordDetails(wordData)
                                }}
                              >
                                <Info className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <Button variant="outline" size="sm" className="flex items-center gap-1 rounded-full" asChild>
                    <a href="/kosa-kata">
                      <span>Lihat semua kata</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="text-muted-foreground">
                    Kirim masukan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Kirim Masukan</DialogTitle>
                    <DialogDescription>
                      Bantu kami meningkatkan kualitas terjemahan dengan memberikan saran atau koreksi.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="feedback">Masukan Anda</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Tulis masukan Anda di sini..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleFeedbackSubmit}>
                      Kirim
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Word Details Dialog */}
        <Dialog open={wordDetailsOpen} onOpenChange={setWordDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            {currentWordDetails && (
              <>
                <DialogHeader className="pr-6">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      {currentWordDetails.text || "Tidak ada kata"}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => speakText(currentWordDetails.text || "")}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </DialogTitle>
                    <div className="flex gap-1 mr-4">
                      <Badge
                        variant="outline"
                        className={`text-xs flex items-center gap-1 ${getCategoryColor(currentWordDetails.word_class_id?.name || "")}`}
                      >
                        {getCategoryIcon(currentWordDetails.word_class_id?.name || "")}
                        <span className="truncate max-w-[80px]">
                          {currentWordDetails.word_class_id?.name || "Tidak ada kategori"}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <DialogDescription className="text-base font-medium mt-1 text-left">
                    {getMeaningsAsString(currentWordDetails.meanings)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Definisi</h4>
                    <p className="text-sm">{currentWordDetails.definition || "Tidak ada definisi"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Contoh Kalimat</h4>
                    {currentWordDetails.example_original || currentWordDetails.example_translation ? (
                      <div className="bg-muted/30 p-3 rounded-md">
                        <p className="text-sm">{currentWordDetails.example_original || "Tidak ada contoh kalimat"}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentWordDetails.example_translation || "Tidak ada terjemahan"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tidak ada contoh kalimat</p>
                    )}
                  </div>

                  {currentWordDetails.pronunciation && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Pengucapan</h4>
                      <p className="text-sm">{currentWordDetails.pronunciation}</p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Kata Terkait</h4>
                    {getRelatedWords(currentWordDetails.related_words || [], isReversed).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {getRelatedWords(currentWordDetails.related_words || [], isReversed).map(
                          (word: string, index: number) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                setInputText(word)
                                setWordDetailsOpen(false)
                              }}
                            >
                              {word}
                            </Button>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Tidak ada kata terkait</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Toaster />
      </>      
  )
}

