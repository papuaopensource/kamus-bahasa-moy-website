"use client"

import { useState, useMemo, useEffect } from "react"
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
import { fetchAllSongs, fetchSong, type SongSummary, type SongDetail } from "@/lib/api"

type SortOption = "title-asc" | "title-desc" | "composer-asc" | "composer-desc"

export default function LirikLaguPage() {
  const [songs, setSongs] = useState<SongSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [currentSong, setCurrentSong] = useState<SongDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOption>("title-asc")
  const [selectedComposer, setSelectedComposer] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchAllSongs()
      .then(setSongs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const uniqueComposers = useMemo(() => {
    return songs
      .map((s) => s.composer)
      .filter((c, i, arr): c is string => !!c && arr.indexOf(c) === i)
      .sort()
  }, [songs])

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesSearch =
        searchQuery === "" ||
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.composer && song.composer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (song.description && song.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesComposer =
        !selectedComposer ||
        (selectedComposer === "unknown" && !song.composer) ||
        song.composer === selectedComposer

      return matchesSearch && matchesComposer
    })
  }, [songs, searchQuery, selectedComposer])

  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      const [field, direction] = sortOrder.split("-")
      if (field === "title") {
        return direction === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
      const ca = a.composer ?? "zzz"
      const cb = b.composer ?? "zzz"
      return direction === "asc" ? ca.localeCompare(cb) : cb.localeCompare(ca)
    })
  }, [filteredSongs, sortOrder])

  const openSongDetail = async (song: SongSummary) => {
    setDialogOpen(true)
    setCurrentSong(null)
    setLoadingDetail(true)
    try {
      const detail = await fetchSong(song.id)
      setCurrentSong(detail)
    } finally {
      setLoadingDetail(false)
    }
  }

  const getSortLabel = () => {
    switch (sortOrder) {
      case "title-asc": return "Judul (A-Z)"
      case "title-desc": return "Judul (Z-A)"
      case "composer-asc": return "Penulis (A-Z)"
      case "composer-desc": return "Penulis (Z-A)"
      default: return "Urutkan"
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Home className="h-4 w-4 text-muted-foreground" />
        <a href="/" className="text-muted-foreground hover:text-foreground text-sm">Beranda</a>
        <span className="text-muted-foreground mx-1">/</span>
        <span className="text-sm font-medium">Lirik Lagu</span>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lirik Lagu Bahasa Moy</h1>
            <p className="text-muted-foreground">Jelajahi kumpulan lirik lagu daerah dalam bahasa Moy</p>
          </div>
          <div className="relative w-full md:w-65">
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
            Total: {loading ? "..." : `${songs.length} lagu`}
            {!loading && (searchQuery || selectedComposer) && (
              <span> • Ditampilkan: {sortedSongs.length} lagu</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {selectedComposer === "unknown" ? "Pencipta Belum Diketahui" : selectedComposer || "Semua Penulis"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-50">
                <DropdownMenuRadioGroup
                  value={selectedComposer ?? ""}
                  onValueChange={(v) => setSelectedComposer(v || null)}
                >
                  <DropdownMenuRadioItem value="">Semua Penulis</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  {uniqueComposers.map((c) => (
                    <DropdownMenuRadioItem key={c} value={c}>{c}</DropdownMenuRadioItem>
                  ))}
                  <DropdownMenuRadioItem value="unknown">Penulis Belum Diketahui</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {sortOrder.includes("asc") ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOption)}>
                  <DropdownMenuRadioItem value="title-asc"><SortAsc className="h-4 w-4 mr-2" />Judul (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title-desc"><SortDesc className="h-4 w-4 mr-2" />Judul (Z-A)</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="composer-asc"><SortAsc className="h-4 w-4 mr-2" />Penulis (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="composer-desc"><SortDesc className="h-4 w-4 mr-2" />Penulis (Z-A)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Memuat data lagu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : sortedSongs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSongs.map((song) => (
              <Card key={song.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{song.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <UserRoundPen className="h-3.5 w-3.5" />
                    {song.composer ?? "Penulis Belum Diketahui"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{song.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end mt-4">
                  <Dialog
                    open={dialogOpen && currentSong?.id === song.id}
                    onOpenChange={(open) => {
                      setDialogOpen(open)
                      if (!open) setCurrentSong(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="w-full" onClick={() => openSongDetail(song)}>
                        Lihat Lirik
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{song.title}</DialogTitle>
                        <DialogDescription>Detail informasi lagu dan lirik.</DialogDescription>
                        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <UserRoundPen className="h-3.5 w-3.5" />
                          {song.composer ?? "Penulis Belum Diketahui"}
                        </div>
                      </DialogHeader>

                      <div className="mt-4">
                        {loadingDetail && !currentSong ? (
                          <p className="text-sm text-muted-foreground py-4">Memuat lirik...</p>
                        ) : currentSong ? (
                          <ScrollArea className="h-96 w-full rounded-md border p-4">
                            <div className="space-y-4">
                              {currentSong.verses.map((verse, index) => {
                                const verseCount = currentSong.verses
                                  .slice(0, index + 1)
                                  .filter((v) => v.type === "verse").length
                                return (
                                  <div key={index} className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground capitalize">
                                      {verse.type === "verse" ? `Bait ${verseCount}` : "Reff"}
                                    </h4>
                                    <div className="space-y-1">
                                      {verse.content.map((line, i) => (
                                        <p key={i} className="text-sm">{line}</p>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </ScrollArea>
                        ) : null}
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
