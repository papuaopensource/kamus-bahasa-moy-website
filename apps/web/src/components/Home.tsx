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
import { fetchAllWords, type WordSummary } from "@/lib/api"

// Function to debounce input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "nomina": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "verba": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "adjektiva": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "pronomina": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "adverbia": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    case "numeralia": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "frasa": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

const getCategoryIcon = (_: string) => <Sparkles className="h-3.5 w-3.5" />

const getMeaningsAsString = (meanings: WordSummary["meanings"]) => {
  if (!meanings || meanings.length === 0) return "Tidak ada arti"
  const names = meanings.map((m) => m.name).filter(Boolean)
  return names.length > 0 ? names.join(", ") : "Tidak ada arti"
}

export default function KamusApp() {
  const [words, setWords] = useState<WordSummary[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isReversed, setIsReversed] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [currentWordDetails, setCurrentWordDetails] = useState<WordSummary | null>(null)
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([])
  const [showAutoComplete, setShowAutoComplete] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [wordDetailsOpen, setWordDetailsOpen] = useState(false)
  const [relatedWords, setRelatedWords] = useState<string[]>([])
  const [selectedRelatedWord, setSelectedRelatedWord] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const relatedWordsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllWords()
      .then(setWords)
      .finally(() => setLoadingData(false))
  }, [])

  const debouncedInputText = useDebounce(inputText, 500)

  useEffect(() => {
    if (debouncedInputText) {
      performTranslation(debouncedInputText)
    } else {
      setTranslatedText("")
      setCurrentWordDetails(null)
      setRelatedWords([])
    }
  }, [debouncedInputText, isReversed, words])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  // related_words from API are already WordSummary objects
  const getRelatedWordTexts = (word: WordSummary, showMoyWords: boolean): string[] => {
    return (word.related_words ?? []).map((r) =>
      showMoyWords ? r.text : r.meanings?.[0]?.name ?? ""
    ).filter(Boolean) as string[]
  }

  const performTranslation = useCallback(
    (text: string) => {
      if (words.length === 0) return
      let result = ""
      const foundWords: WordSummary[] = []

      if (isReversed) {
        const moyPhrase = text.toLowerCase().trim()
        const foundPhrase = words.find((w) => w.text?.toLowerCase() === moyPhrase)
        if (foundPhrase) {
          result = foundPhrase.meanings?.[0]?.name ?? "Tidak ada terjemahan"
          foundWords.push(foundPhrase)
        } else {
          text.toLowerCase().split(/\s+/).forEach((w) => {
            const found = words.find((item) => item.text?.toLowerCase() === w)
            result += found ? (found.meanings?.[0]?.name ?? "Tidak ada terjemahan") + " " : w + " "
            if (found) foundWords.push(found)
          })
        }
      } else {
        const indoPhrase = text.toLowerCase().trim()
        const foundPhrase = words.find((w) =>
          w.meanings?.some((m) => m.name?.toLowerCase() === indoPhrase)
        )
        if (foundPhrase) {
          result = foundPhrase.text ?? "Tidak ada terjemahan"
          foundWords.push(foundPhrase)
        } else {
          text.toLowerCase().split(/\s+/).forEach((w) => {
            const found = words.find((item) =>
              item.meanings?.some((m) => m.name?.toLowerCase() === w)
            )
            result += found ? (found.text ?? "Tidak ada terjemahan") + " " : w + " "
            if (found) foundWords.push(found)
          })
        }
      }

      setTranslatedText(result.trim())

      if (foundWords.length === 1) {
        setCurrentWordDetails(foundWords[0])
        setRelatedWords(getRelatedWordTexts(foundWords[0], isReversed))
      } else {
        setCurrentWordDetails(null)
        setRelatedWords([])
      }
    },
    [isReversed, words],
  )

  const swapLanguages = () => {
    setIsReversed(!isReversed)
    setInputText(translatedText)
    setTranslatedText(inputText)
    setCurrentWordDetails(null)
    setRelatedWords([])
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "id-ID"
      window.speechSynthesis.speak(utterance)
    } else {
      toast({ title: "Fitur tidak didukung", description: "Browser Anda tidak mendukung text-to-speech", variant: "destructive" })
    }
  }

  const generateAutoCompleteSuggestions = (text: string) => {
    if (!text.trim() || words.length === 0) { setShowAutoComplete(false); return }
    const lastWord = text.toLowerCase().trim().split(/\s+/).pop() ?? ""
    if (lastWord.length < 1) { setShowAutoComplete(false); return }

    const exactMatch = words.some((w) =>
      isReversed
        ? w.text?.toLowerCase() === lastWord
        : w.meanings?.some((m) => m.name?.toLowerCase() === lastWord)
    )
    if (exactMatch) { setShowAutoComplete(false); return }

    const wordSuggestions = words
      .filter((w) =>
        isReversed
          ? w.text?.toLowerCase().startsWith(lastWord)
          : w.meanings?.some((m) => m.name?.toLowerCase().startsWith(lastWord))
      )
      .map((w) => isReversed ? w.text : w.meanings?.[0]?.name ?? "")
      .filter(Boolean) as string[]

    const phraseSuggestions: string[] = []
    if (lastWord === "apa") phraseSuggestions.push("apa kabar", "apa kabar hari ini")
    else if (lastWord === "selamat") phraseSuggestions.push("selamat pagi", "selamat siang", "selamat malam")
    else if (lastWord === "terima") phraseSuggestions.push("terima kasih", "terima kasih banyak")

    const all = [...wordSuggestions, ...phraseSuggestions].slice(0, 5)
    setAutoCompleteSuggestions(all)
    setShowAutoComplete(all.length > 0)
  }

  const applySuggestion = (suggestion: string) => {
    const parts = inputText.toLowerCase().split(/\s+/)
    parts.pop()
    parts.push(suggestion)
    setInputText(parts.join(" "))
    setShowAutoComplete(false)
    inputRef.current?.focus()
  }

  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText)
      setIsCopied(true)
      toast({ title: "Teks disalin!", description: "Terjemahan telah disalin ke clipboard." })
    }
  }

  useEffect(() => {
    if (selectedRelatedWord) {
      setInputText(selectedRelatedWord)
      setSelectedRelatedWord(null)
    }
  }, [selectedRelatedWord])

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-6">
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
            <div className="relative">
              <Textarea
                ref={inputRef}
                placeholder={loadingData ? "Memuat kamus..." : "Masukan kosa kata..."}
                disabled={loadingData}
                className="bg-white min-h-50 resize-none p-4 rounded-md border focus-visible:ring-1 focus-visible:ring-primary"
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); generateAutoCompleteSuggestions(e.target.value) }}
                onFocus={() => generateAutoCompleteSuggestions(inputText)}
                maxLength={5000}
              />

              {showAutoComplete && autoCompleteSuggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute left-0 right-0 mt-1 bg-background border rounded-md shadow-md z-10">
                  <ScrollArea className="max-h-50">
                    {autoCompleteSuggestions.map((suggestion, index) => {
                      const matchWord = words.find((w) =>
                        isReversed
                          ? w.meanings?.some((m) => m.name === suggestion)
                          : w.text?.toLowerCase() === suggestion.toLowerCase()
                      )
                      return (
                        <div key={index} className="px-3 py-2 hover:bg-muted cursor-pointer" onClick={() => applySuggestion(suggestion)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{suggestion}</span>
                            {matchWord && (
                              <span className="text-xs text-muted-foreground">
                                {isReversed ? matchWord.text : matchWord.meanings?.[0]?.name ?? ""}
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

            <div className="relative min-h-50 bg-muted rounded-md p-4">
              {translatedText ? (
                <div>
                  <p className="text-lg">{translatedText}</p>
                  {currentWordDetails && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs flex items-center gap-1 ${getCategoryColor(currentWordDetails.word_class?.name ?? "")}`}
                        >
                          {getCategoryIcon(currentWordDetails.word_class?.name ?? "")}
                          <span className="truncate max-w-20">{currentWordDetails.word_class?.name ?? "—"}</span>
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setWordDetailsOpen(true)}>
                          <Info className="h-3 w-3 mr-1" />Detail
                        </Button>
                      </div>
                      {currentWordDetails.pronunciation && (
                        <div className="text-sm border-l-2 border-muted-foreground/20 pl-3 mt-2">
                          <p className="text-muted-foreground italic">{currentWordDetails.pronunciation}</p>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => speakText(translatedText)}>
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
                  const wordData = !isReversed
                    ? words.find((w) => w.text?.toLowerCase() === word.toLowerCase())
                    : words.find((w) => w.meanings?.some((m) => m.name?.toLowerCase() === word.toLowerCase()))
                  return (
                    <div
                      key={index}
                      className={`group relative px-3 py-2 rounded-full border ${
                        wordData?.word_class?.name ? getCategoryColor(wordData.word_class.name).split(" ")[0] : "bg-muted"
                      } hover:shadow-md transition-all cursor-pointer`}
                      onClick={() => setSelectedRelatedWord(word)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{word}</span>
                        {wordData && (
                          <Badge variant="outline" className="text-xs bg-white/80 dark:bg-black/30">
                            {isReversed ? wordData.text : wordData.meanings?.[0]?.name ?? ""}
                          </Badge>
                        )}
                        {wordData && (
                          <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setCurrentWordDetails(wordData); setWordDetailsOpen(true) }}>
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
        </div>
      </div>

      <Dialog open={wordDetailsOpen} onOpenChange={setWordDetailsOpen}>
        <DialogContent className="sm:max-w-125">
          {currentWordDetails && (
            <>
              <DialogHeader className="pr-6">
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    {currentWordDetails.text}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => speakText(currentWordDetails.text)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                  <div className="flex gap-1 mr-4">
                    <Badge
                      variant="outline"
                      className={`text-xs flex items-center gap-1 ${getCategoryColor(currentWordDetails.word_class?.name ?? "")}`}
                    >
                      {getCategoryIcon(currentWordDetails.word_class?.name ?? "")}
                      <span className="truncate max-w-20">{currentWordDetails.word_class?.name ?? "—"}</span>
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
                  <p className="text-sm">{(currentWordDetails as any).definition ?? "Tidak ada definisi"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Contoh Kalimat</h4>
                  {(currentWordDetails as any).example_original || (currentWordDetails as any).example_translation ? (
                    <div className="bg-muted/30 p-3 rounded-md">
                      <p className="text-sm">{(currentWordDetails as any).example_original}</p>
                      <p className="text-sm text-muted-foreground mt-1">{(currentWordDetails as any).example_translation}</p>
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
                  {getRelatedWordTexts(currentWordDetails, isReversed).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getRelatedWordTexts(currentWordDetails, isReversed).map((word, index) => (
                        <Button key={index} variant="outline" size="sm" className="rounded-full"
                          onClick={() => { setInputText(word); setWordDetailsOpen(false) }}>
                          {word}
                        </Button>
                      ))}
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
