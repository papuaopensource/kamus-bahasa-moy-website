"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { Home, Search, Music, Play, Pause, Volume2, ChevronDown, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Slider } from "@/components/ui/slider"
import songsData from "@/data/songs.json"

type SortOption = "title-asc" | "title-desc" | "artist-asc" | "artist-desc"

export default function LirikLaguPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSong, setCurrentSong] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sortOrder, setSortOrder] = useState<SortOption>("title-asc")
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Get unique artists for filter
  const uniqueArtists = useMemo(() => {
    const artists = songsData.songs
      .map((song) => song.artist)
      .filter((artist, index, self) => artist && self.indexOf(artist) === index) as string[]

    return artists.sort()
  }, [])

  // Filter songs based on search and artist
  const filteredSongs = useMemo(() => {
    return songsData.songs.filter((song) => {
      const matchesSearch =
        searchQuery === "" ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (song.composer && song.composer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        song.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Special handling for "unknown" artist filter
      const matchesArtist =
        !selectedArtist || (selectedArtist === "unknown" && !song.artist) || song.artist === selectedArtist

      return matchesSearch && matchesArtist
    })
  }, [searchQuery, selectedArtist])

  // Sort filtered songs
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      const [field, direction] = sortOrder.split("-")

      if (field === "title") {
        return direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else if (field === "artist") {
        const artistA = a.artist || "zzz" // Place null artists at the end
        const artistB = b.artist || "zzz"
        return direction === "asc" ? artistA.localeCompare(artistB) : artistB.localeCompare(artistA)
      }
      return 0
    })
  }, [filteredSongs, sortOrder])

  // Reset audio when dialog closes
  useEffect(() => {
    if (!dialogOpen && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [dialogOpen])

  // Audio player functions
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Get sort label
  const getSortLabel = () => {
    switch (sortOrder) {
      case "title-asc":
        return "Judul (A-Z)"
      case "title-desc":
        return "Judul (Z-A)"
      case "artist-asc":
        return "Artis (A-Z)"
      case "artist-desc":
        return "Artis (Z-A)"
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
            <h1 className="text-3xl font-bold tracking-tight">Lirik Lagu Daerah Papua</h1>
            <p className="text-muted-foreground">
              Jelajahi kumpulan lirik lagu daerah Papua dalam bahasa Moy dengan terjemahan
            </p>
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
            {(searchQuery || selectedArtist) && <span> • Ditampilkan: {sortedSongs.length} lagu</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {selectedArtist === "unknown" ? "Artis Belum Diketahui" : selectedArtist || "Semua Artis"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup
                  value={selectedArtist || ""}
                  onValueChange={(value) => setSelectedArtist(value || null)}
                >
                  <DropdownMenuRadioItem value="">Semua Artis</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {uniqueArtists.map((artist) => (
                    <DropdownMenuRadioItem key={artist} value={artist}>
                      {artist}
                    </DropdownMenuRadioItem>
                  ))}
                  <DropdownMenuRadioItem value="unknown">Artis Belum Diketahui</DropdownMenuRadioItem>
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
                <DropdownMenuRadioGroup
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as SortOption)}
                >
                  <DropdownMenuRadioItem value="title-asc">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Judul (A-Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title-desc">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Judul (Z-A)
                  </DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="artist-asc">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Artis (A-Z)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="artist-desc">
                    <SortDesc className="h-4 w-4 mr-2" />
                    Artis (Z-A)
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
                    <Music className="h-3 w-3" />
                    {song.artist || "Artis Belum Diketahui"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{song.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end mt-4">
                  <Dialog
                    open={dialogOpen && currentSong?.id === song.id}
                    onOpenChange={(open) => {
                      setDialogOpen(open)
                      if (open) setCurrentSong(song)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="w-full">
                        Lihat Lirik
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{song.title}</DialogTitle>
                        <DialogDescription>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
                            <div className="flex items-center gap-1">
                              <Music className="h-3.5 w-3.5" />
                              {song.artist || "Artis Belum Diketahui"}
                            </div>
                            {song.composer && (
                              <div className="text-muted-foreground text-sm">Penulis/Pencipta: {song.composer}</div>
                            )}
                          </div>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-4">{song.description}</p>

                        {/* Audio Player */}
                        <div className="bg-muted/30 p-4 rounded-md mb-4">
                          {song.audioUrl ? (
                            <>
                              <audio
                                ref={audioRef}
                                src={song.audioUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                              />
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={togglePlayPause}
                                  >
                                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                  </Button>
                                  <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                                </div>
                                <Slider
                                  value={[currentTime]}
                                  max={duration || 100}
                                  step={0.1}
                                  onValueChange={handleSliderChange}
                                  className="w-full"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                              <Volume2 className="h-10 w-10 text-muted-foreground mb-3" />
                              <h3 className="text-sm font-medium">Audio tidak tersedia</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                Audio untuk lagu ini belum tersedia
                              </p>
                            </div>
                          )}
                        </div>

                        <Tabs defaultValue="lyrics" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="lyrics">Lirik Asli</TabsTrigger>
                            <TabsTrigger value="translation">
                              Terjemahan
                              {!song.translation && (
                                <span className="ml-1.5 inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/30">
                                  Belum tersedia
                                </span>
                              )}
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="lyrics" className="mt-4">
                            <ScrollArea className="h-[300px] pr-4">
                              <div className="space-y-6">
                                {song.lyrics.map((section: any, index: number) => (
                                  <div key={index} className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground capitalize">
                                      {section.type === "verse" ? "Bait" : "Reff"} {index + 1}
                                    </h4>
                                    <div className="space-y-1">
                                      {section.content.map((line: string, lineIndex: number) => (
                                        <p key={lineIndex} className="text-sm">
                                          {line}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                          <TabsContent value="translation" className="mt-4">
                            {song.translation ? (
                              <ScrollArea className="h-[300px] pr-4">
                                <div className="space-y-6">
                                  {song.translation.map((section: any, index: number) => (
                                    <div key={index} className="space-y-2">
                                      <h4 className="text-sm font-medium text-muted-foreground capitalize">
                                        {section.type === "verse" ? "Bait" : "Reff"} {index + 1}
                                      </h4>
                                      <div className="space-y-1">
                                        {section.content.map((line: string, lineIndex: number) => (
                                          <p key={lineIndex} className="text-sm">
                                            {line}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/30 rounded-lg p-6 max-w-md">
                                  <Volume2 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-400">
                                    Terjemahan belum tersedia
                                  </h3>
                                  <p className="text-slate-700 dark:text-slate-500 mt-2">
                                    Kami sedang bekerja untuk menambahkan terjemahan untuk lagu "{song.title}".
                                    Silakan kembali lagi nanti.
                                  </p>
                                  <p className="text-slate-700 dark:text-slate-500 mt-3 text-sm">
                                    Ingin membantu? Anda dapat berkontribusi dengan menambahkan terjemahan lagu ini.
                                    Silakan baca{" "}
                                    <a
                                      href="/tentang/#kontribusi"
                                      className="text-slate-600 dark:text-slate-400 underline hover:text-slate-800 dark:hover:text-slate-300"
                                    >
                                      panduan kontribusi
                                    </a>{" "}
                                    kami.
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/40"
                                    onClick={() => setDialogOpen(false)}
                                  >
                                    Kembali ke daftar lagu
                                  </Button>
                                </div>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Tidak ada lagu yang ditemukan</h3>
            <p className="text-muted-foreground">Coba ubah kata kunci pencarian Anda</p>
          </div>
        )}
      </div>
    </div>
  )
}

