"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useMemo } from "react"
import { BookOpen, ChevronDown, Home, Search, Volume2, Sparkles, Grid, List, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import dictionaryData from "@/data/dictionary.json"
import { Separator } from "@/components/ui/separator"

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

// Function to get all meanings as a string
const getMeaningsAsString = (meanings: Array<{ id: number; name: string }> | null | undefined) => {
  if (!meanings || meanings.length === 0) return "Tidak ada arti"
  return meanings.map((meaning) => meaning.name).join(", ")
}

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

// Safely filter and extract unique categories
const safeData = dictionaryData.filter((word) => word && word.word_class_id && word.word_class_id.name)
const uniqueCategories = Array.from(new Set(safeData.map((word) => word.word_class_id.name)))

// Extract unique categories from dictionary data
const categories = [
  { id: "all", name: "Semua" },
  ...uniqueCategories.map((name) => {
    const word = safeData.find((w) => w.word_class_id.name === name)
    return {
      id: name,
      name: `${String(name).charAt(0).toUpperCase() + String(name).slice(1)} (${word?.word_class_id?.abbreviation || ""})`,
    }
  }),
]

export default function KosaKataPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLetter, setSelectedLetter] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentWordDetails, setCurrentWordDetails] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter vocabulary based on search, category, and letter
  const filteredVocabulary = useMemo(() => {
    return dictionaryData
      .filter((word) => {
        if (!word || !word.text) return false

        const matchesSearch =
          searchQuery === "" ||
          word.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (word.meanings &&
            word.meanings.some((meaning: {name: string}) => meaning?.name?.toLowerCase().includes(searchQuery.toLowerCase())))

        const matchesCategory =
          selectedCategory === "all" || (word.word_class_id && word.word_class_id.name === selectedCategory)

        const matchesLetter = selectedLetter === "" || (word.text && word.text.toUpperCase().startsWith(selectedLetter))

        return matchesSearch && matchesCategory && matchesLetter
      })
      .sort((a, b) => {
        if (!a.text) return 1
        if (!b.text) return -1

        if (sortOrder === "asc") {
          return a.text.localeCompare(b.text)
        } else {
          return b.text.localeCompare(a.text)
        }
      })
  }, [searchQuery, selectedCategory, selectedLetter, sortOrder])

  // Function to speak text using browser's speech synthesis
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "id-ID" // Indonesian language
      window.speechSynthesis.speak(utterance)
    }
  }

  // Function to get related words data
  const getRelatedWords = (relatedIds: number[] | null | undefined) => {
    if (!relatedIds || relatedIds.length === 0) return []
    return relatedIds
      .map((id) => {
        const word = dictionaryData.find((w) => w && w.id === id)
        return word ? word.text : ""
      })
      .filter(Boolean)
  }

  return (

    <div className="max-w-screen-xl mx-auto px-4 py-6 md:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Home className="h-4 w-4 text-muted-foreground" />
        <a href="/" className="text-muted-foreground hover:text-foreground text-sm">
          Beranda
        </a>
        <span className="text-muted-foreground mx-1">/</span>
        <span className="text-sm font-medium">Kosa Kata</span>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kosa Kata</h1>
            <p className="text-muted-foreground">
              Jelajahi kosa kata bahasa Indonesia dan terjemahannya dalam bahasa Moy
            </p>
          </div>

          <div className="relative w-full md:w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kata..."
              className="bg-white pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <CardTitle>Daftar Kosa Kata</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>Total: {dictionaryData.length} kata</span>
                    {(selectedCategory !== "all" || searchQuery || selectedLetter) && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span>Ditampilkan: {filteredVocabulary.length} kata</span>
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        {selectedCategory === "all"
                          ? "Semua Kategori"
                          : categories.find((c) => c.id === selectedCategory)?.name || "Kategori"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[220px]">
                      <DropdownMenuRadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                        <DropdownMenuRadioItem value="all">
                          Semua Kategori
                          <span className="ml-auto text-xs text-muted-foreground">{dictionaryData.length}</span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        {categories.slice(1).map((category) => (
                          <DropdownMenuRadioItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getCategoryColor(category.id).split(" ")[0]}`}
                              ></div>
                              {category.name}
                            </div>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {dictionaryData.filter((word) => word?.word_class_id?.name === category.id).length}
                            </span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => value && setViewMode(value as "grid" | "list")}
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid View">
                      <Grid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List View">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        {sortOrder === "asc" ? (
                          <SortAsc className="h-4 w-4 mr-2" />
                        ) : (
                          <SortDesc className="h-4 w-4 mr-2" />
                        )}
                        {sortOrder === "asc" ? "A-Z" : "Z-A"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuRadioGroup
                        value={sortOrder}
                        onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                      >
                        <DropdownMenuRadioItem value="asc">
                          <SortAsc className="h-4 w-4 mr-2" />
                          A-Z
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="desc">
                          <SortDesc className="h-4 w-4 mr-2" />
                          Z-A
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  className={selectedLetter === "" ? "bg-primary text-white" : "bg-slate-100 text-black hover:text-white"}
                  size="sm"
                  onClick={() => setSelectedLetter("")}
                >
                  Semua
                </Button>
                {alphabets.map((letter) => (
                  <Button
                    key={letter}
                    className={selectedLetter === letter ? "bg-primary text-white" : "bg-slate-100 text-black hover:text-white"}
                    size="sm"
                    onClick={() => setSelectedLetter(letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[500px] pr-4">
                {filteredVocabulary.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredVocabulary.map((word) => (
                        <Dialog
                          key={word.id}
                          open={dialogOpen && currentWordDetails?.id === word.id}
                          onOpenChange={(open) => {
                            setDialogOpen(open)
                            if (open) setCurrentWordDetails(word)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Card className="rounded-sm shadow-none py-2 cursor-pointer hover:bg-muted/50 transition-colors">
                              <CardContent>
                              <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{word.text || "Tidak ada kata"}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {getMeaningsAsString(word.meanings)}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs flex items-center gap-1 ${getCategoryColor(word.word_class_id?.name || "")}`}
                                  >
                                    {getCategoryIcon(word.word_class_id?.name || "")}
                                    {word.word_class_id?.name || "Tidak ada kategori"}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader className="pr-6">
                              <div className="flex items-center justify-between">
                                <DialogTitle className="flex items-center gap-2 text-2xl">
                                  {word.text || "Tidak ada kata"}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => speakText(word.text || "")}
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </Button>
                                </DialogTitle>
                                <div className="flex gap-1 mr-4">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs flex items-center gap-1 ${getCategoryColor(word.word_class_id?.name || "")}`}
                                  >
                                    {getCategoryIcon(word.word_class_id?.name || "")}
                                    <span className="truncate max-w-[80px]">
                                      {word.word_class_id?.name || "Tidak ada kategori"}
                                    </span>
                                  </Badge>
                                </div>
                              </div>
                              <DialogDescription className="text-base font-medium mt-1">
                                {getMeaningsAsString(word.meanings)}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Definisi</h4>
                                <p className="text-sm">{word.definition || "Tidak ada definisi"}</p>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Contoh Kalimat</h4>
                                {word.example_original || word.example_translation ? (
                                  <div className="bg-muted/30 p-3 rounded-md">
                                    <p className="text-sm">{word.example_original || "Tidak ada contoh kalimat"}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {word.example_translation || "Tidak ada terjemahan"}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Tidak ada contoh kalimat</p>
                                )}
                              </div>

                              {word.pronunciation && (
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Pengucapan</h4>
                                  <p className="text-sm">{word.pronunciation}</p>
                                </div>
                              )}

                              <Separator />

                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Kata Terkait</h4>
                                {getRelatedWords(word.related_words).length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {getRelatedWords(word.related_words).map((relatedWord, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => {
                                          const relatedWordData = dictionaryData.find(
                                            (w) => w && w.text && w.text.toLowerCase() === relatedWord.toLowerCase(),
                                          )
                                          if (relatedWordData) {
                                            setDialogOpen(false)
                                            setTimeout(() => {
                                              setSearchQuery(relatedWord)
                                            }, 100)
                                          }
                                        }}
                                      >
                                        {relatedWord}
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Tidak ada kata terkait</p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredVocabulary.map((word) => (
                        <Dialog
                          key={word.id}
                          open={dialogOpen && currentWordDetails?.id === word.id}
                          onOpenChange={(open) => {
                            setDialogOpen(open)
                            if (open) setCurrentWordDetails(word)
                          }}
                        >
                          <DialogTrigger asChild>
                            <div className="flex justify-between items-center p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer border">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-1.5 h-10 rounded-full ${getCategoryColor(word.word_class_id?.name || "").split(" ")[0]}`}
                                ></div>
                                <div>
                                  <h3 className="font-medium">{word.text || "Tidak ada kata"}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {getMeaningsAsString(word.meanings)}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs flex items-center gap-1 ${getCategoryColor(word.word_class_id?.name || "")}`}
                              >
                                {getCategoryIcon(word.word_class_id?.name || "")}
                                {word.word_class_id?.name || "Tidak ada kategori"}
                              </Badge>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader className="pr-6">
                              <div className="flex items-center justify-between">
                                <DialogTitle className="flex items-center gap-2 text-2xl">
                                  {word.text || "Tidak ada kata"}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => speakText(word.text || "")}
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </Button>
                                </DialogTitle>
                                <div className="flex gap-1 mr-4">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs flex items-center gap-1 ${getCategoryColor(word.word_class_id?.name || "")}`}
                                  >
                                    {getCategoryIcon(word.word_class_id?.name || "")}
                                    <span className="truncate max-w-[80px]">
                                      {word.word_class_id?.name || "Tidak ada kategori"}
                                    </span>
                                  </Badge>
                                </div>
                              </div>
                              <DialogDescription className="text-base font-medium mt-1">
                                {getMeaningsAsString(word.meanings)}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Definisi</h4>
                                <p className="text-sm">{word.definition || "Tidak ada definisi"}</p>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Contoh Kalimat</h4>
                                {word.example_original || word.example_translation ? (
                                  <div className="bg-muted/30 p-3 rounded-md">
                                    <p className="text-sm">{word.example_original || "Tidak ada contoh kalimat"}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {word.example_translation || "Tidak ada terjemahan"}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Tidak ada contoh kalimat</p>
                                )}
                              </div>

                              {word.pronunciation && (
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Pengucapan</h4>
                                  <p className="text-sm">{word.pronunciation}</p>
                                </div>
                              )}

                              <Separator />

                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Kata Terkait</h4>
                                {getRelatedWords(word.related_words).length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {getRelatedWords(word.related_words).map((relatedWord, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => {
                                          const relatedWordData = dictionaryData.find(
                                            (w) => w && w.text && w.text.toLowerCase() === relatedWord.toLowerCase(),
                                          )
                                          if (relatedWordData) {
                                            setDialogOpen(false)
                                            setTimeout(() => {
                                              setSearchQuery(relatedWord)
                                            }, 100)
                                          }
                                        }}
                                      >
                                        {relatedWord}
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Tidak ada kata terkait</p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tidak ada kata yang ditemukan</h3>
                    <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

  )
}

