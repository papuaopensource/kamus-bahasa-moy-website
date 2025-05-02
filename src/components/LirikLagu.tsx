"use client"

import { useState, useRef, useMemo } from "react"
import { Home, Search, UserRoundPen, ChevronDown, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import songsData from "@/data/songs.json"

type SortOption = "title-asc" | "title-desc" | "composer-asc" | "composer-desc"

export default function LirikLaguPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSong, setCurrentSong] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sortOrder, setSortOrder] = useState<SortOption>("title-asc")
  const [selectedComposer, setSelectedComposer] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Get unique song writer for filter
  const uniqueComposers = useMemo(() => {
    const composers = songsData.songs
      .map((song) => song.composer)
      .filter((composer, index, self) => composer && self.indexOf(composer) === index) as string[]

    return composers.sort()
  }, [])

  // Filter songs based on search and songwriter
  const filteredSongs = useMemo(() => {
    return songsData.songs.filter((song) => {
      const matchesSearch =
        searchQuery === "" ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.composer && song.composer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        song.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Special handling for "unknown" songwriter filter
      const matchesComposer =
        !selectedComposer || (selectedComposer === "unknown" && !song.composer) || song.composer === selectedComposer

      return matchesSearch && matchesComposer
    })
  }, [searchQuery, selectedComposer])

  // Sort filtered songs
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      const [field, direction] = sortOrder.split("-")

      if (field === "title") {
        return direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else if (field === "composer") {
        const composerA = a.composer || "zzz" // Place null composers at the end
        const composerB = b.composer || "zzz"
        return direction === "asc" ? composerA.localeCompare(composerB) : composerB.localeCompare(composerA)
      }
      return 0
    })
  }, [filteredSongs, sortOrder])

  // Get sort label
  const getSortLabel = () => {
    switch (sortOrder) {
      case "title-asc":
        return "Judul (A-Z)"
      case "title-desc":
        return "Judul (Z-A)"
      case "composer-asc":
        return "Penulis (A-Z)"
      case "composer-desc":
        return "Penulis (Z-A)"
      default:
        return "Urutkan"
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Home className="h-4 w-4 text-muted-foreground" />
        <a href="/" className="text-muted-foreground hover:text-foreground text-sm">
          Beranda
        </a>
        <span className="text-muted-foreground mx-1">/</span>
        <span className="text-sm font-medium">Lirik Lagu</span>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lirik Lagu Bahasa Moy</h1>
            <p className="text-muted-foreground">Jelajahi kumpulan lirik lagu daerah dalam bahasa Moy</p>
          </div>

          <div className="relative w-full md:w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari lagu..."
              className="bg-white pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="text-sm text-muted-foreground">
            Total: {songsData.songs.length} lagu
            {(searchQuery || selectedComposer) && <span> • Ditampilkan: {sortedSongs.length} lagu</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {selectedComposer === "unknown" ? "Pencipta Belum Diketahui" : selectedComposer || "Semua Penulis"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup
                  value={selectedComposer || ""}
                  onValueChange={(value) => setSelectedComposer(value || null)}
                >
                  <DropdownMenuRadioItem value="">Semua Penulis</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {uniqueComposers.map((composer) => (
                    <DropdownMenuRadioItem key={composer} value={composer}>
                      {composer}
                    </DropdownMenuRadioItem>
                  ))}
                  <DropdownMenuRadioItem value="unknown">Penulis Belum Diketahui</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {sortOrder.includes("asc") ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOption)}>
                  <DropdownMenuRadioItem value="title-asc">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Judul (A-Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title-desc">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Judul (Z-A)
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="composer-asc">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Penulis (A-Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="composer-desc">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Penulis (Z-A)
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {sortedSongs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSongs.map((song) => (
              <Card key={song.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{song.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <UserRoundPen className="h-3.5 w-3.5" />
                    {song.composer || "Penulis Belum Diketahui"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{song.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end mt-4">
                <Dialog
                    open={dialogOpen && currentSong?.id === song.id}
                    onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setCurrentSong(song);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="w-full">
                        Lihat Lirik
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{song.title}</DialogTitle>
                        <DialogDescription>
                          Detail informasi lagu dan lirik.
                        </DialogDescription>
                        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <UserRoundPen className="h-3.5 w-3.5" />
                            {song.composer || "Penulis Belum Diketahui"}
                          </div>
                        </div>
                      </DialogHeader>


                      <div className="mt-4">
                        <ScrollArea className="h-96 w-full rounded-md border p-4">
                          <div className="space-y-4">
                            {song.lyrics.map((section: any, index: number) => {
                              const isVerse = section.type === "verse";

                              // Hitung jumlah bait sebelum index saat ini
                              const verseCount = song.lyrics
                                .slice(0, index + 1)
                                .filter((s: any) => s.type === "verse").length;

                              return (
                                <div key={index} className="space-y-2">
                                  <h4 className="text-sm font-medium text-muted-foreground capitalize">
                                    {isVerse ? `Bait ${verseCount}` : "Reff"}
                                  </h4>
                                  <div className="space-y-1">
                                    {section.content.map((line: string, lineIndex: number) => (
                                      <p key={lineIndex} className="text-sm">
                                        {line}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserRoundPen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Tidak ada lagu yang ditemukan</h3>
            <p className="text-muted-foreground">Coba ubah kata kunci pencarian Anda</p>
          </div>
        )}
      </div>
    </div>
  )
}
