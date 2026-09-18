"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/tender-mock"
import type { TenderMatch } from "@/lib/tender-types"
import {
  Sparkles,
  MapPin,
  CalendarClock,
  Wallet,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSearch,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"

type Props = {
  matches: TenderMatch[]
  loading: boolean
  hasSearched: boolean
  selectedId: string | null
  onSelect: (id: string) => void
}

const RANK_LABELS = ["#1 Best Match", "#2 Best Match", "#3 Match"]

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 55) return "text-amber-600 dark:text-amber-400"
  return "text-muted-foreground"
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/30 p-10 text-center">
      {loading ? (
        <>
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-amber-500" />
          <h3 className="text-base font-semibold">Analyzing your profile…</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Matching your company against available public tenders and scoring each one.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
            <FileSearch className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-base font-semibold">Your top tenders will appear here</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Complete your company profile on the left and run the match to spin up the 3 best tenders in the focus
            lane, with an AI explanation of why they fit.
          </p>
        </>
      )}
    </div>
  )
}

/** Dimmed, tilted, out-of-focus card for tenders that did not make the Top 3. */
function GhostCard({ match, tier }: { match: TenderMatch; tier: "far" | "near" }) {
  const { tender, score } = match
  const style =
    tier === "far"
      ? { opacity: 0.28, filter: "blur(3.5px)" }
      : { opacity: 0.55, filter: "blur(1.5px)" }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none w-full select-none rounded-lg border border-border/50 bg-background/70 px-3 py-2 shadow-sm"
      style={style}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-muted-foreground">{tender.title}</span>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">{score}%</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] text-muted-foreground/70">{tender.authority}</span>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground/70">
          Not in Top 3
        </span>
      </div>
    </div>
  )
}

/** The sharp, fully-visible focus card locked into the center lane. */
function FocusCard({
  match,
  rank,
  isSelected,
  onSelect,
}: {
  match: TenderMatch
  rank: number
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const { tender, score, reasons, considerations, summary } = match
  return (
    <div
      className={`z-10 flex h-[360px] w-full flex-col rounded-xl border bg-card shadow-lg transition-all ${
        isSelected ? "border-amber-500 ring-2 ring-amber-500/40" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b p-3">
        <div className="min-w-0 space-y-1">
          <Badge variant="secondary" className="rounded-md text-[10px]">
            {RANK_LABELS[rank] ?? `#${rank + 1} Match`}
          </Badge>
          <h3 className="truncate text-sm font-semibold leading-snug">{tender.title}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{tender.authority}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className={`text-xl font-bold ${scoreColor(score)}`}>{score}%</div>
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground">match</div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <Progress value={score} className="h-1.5" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="h-3 w-3 shrink-0" />
            <span className="truncate text-foreground">{formatCurrency(tender.value, tender.currency)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate text-foreground">{tender.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="h-3 w-3 shrink-0" />
            <span className="truncate text-foreground">{tender.deadline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate text-foreground">{tender.role}</span>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-2.5 dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />
            AI analysis
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{summary}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Why it fits
          </p>
          <ul className="space-y-1">
            {reasons.length > 0 ? (
              reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                  <span>{r}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-muted-foreground">No strong positive signals detected.</li>
            )}
          </ul>
        </div>

        {considerations.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Points to consider
            </p>
            <ul className="space-y-1">
              {considerations.slice(0, 2).map((c, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => {
            onSelect(tender.id)
            toast.success(isSelected ? "Tender kept as selected" : `Selected "${tender.title}"`)
          }}
        >
          {isSelected ? "Selected" : "Choose this tender"}
        </Button>
      </div>
    </div>
  )
}

/** A single vertical drum: dimmed ghosts above, a focus card in the lane, dimmed ghosts below. */
function ReelColumn({
  focus,
  rank,
  ghostsAbove,
  ghostsBelow,
  isSelected,
  onSelect,
}: {
  focus: TenderMatch
  rank: number
  ghostsAbove: TenderMatch[]
  ghostsBelow: TenderMatch[]
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 overflow-hidden px-1"
      style={{ transformStyle: "preserve-3d" }}
    >
      {ghostsAbove.map((g, i) => {
        const far = i === 0 && ghostsAbove.length > 1
        return (
          <div
            key={`up-${g.tender.id}-${i}`}
            className="w-full"
            style={{
              transform: `rotateX(${far ? 42 : 22}deg) scale(${far ? 0.78 : 0.9})`,
              transformOrigin: "center bottom",
            }}
          >
            <GhostCard match={g} tier={far ? "far" : "near"} />
          </div>
        )
      })}

      <FocusCard match={focus} rank={rank} isSelected={isSelected} onSelect={onSelect} />

      {ghostsBelow.map((g, i) => {
        const far = i === ghostsBelow.length - 1 && ghostsBelow.length > 1
        return (
          <div
            key={`down-${g.tender.id}-${i}`}
            className="w-full"
            style={{
              transform: `rotateX(${far ? -42 : -22}deg) scale(${far ? 0.78 : 0.9})`,
              transformOrigin: "center top",
            }}
          >
            <GhostCard match={g} tier={far ? "far" : "near"} />
          </div>
        )
      })}
    </div>
  )
}

export function TenderResults({ matches, loading, hasSearched, selectedId, onSelect }: Props) {
  if (loading || !hasSearched) {
    return <EmptyState loading={loading} />
  }

  const top3 = matches.slice(0, 3)
  const others = matches.slice(3)

  // Distribute the "others" across the three drums so each reel has ghosts
  // spinning above and below its locked-in focus card.
  const ghostPool = others.length > 0 ? others : matches.slice(0, 3)
  const pick = (offset: number, count: number) =>
    Array.from({ length: count }, (_, k) => ghostPool[(offset + k) % ghostPool.length])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{top3.length} best-matched tenders</span> locked in the
            focus lane, ranked by suitability.
          </p>
        </div>
        <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
          Others dimmed above &amp; below
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/40 via-background to-muted/40 p-4">
        {/* top / bottom fade masks to sell the drum curvature */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-background to-transparent" />

        {/* spin hints */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-30 -translate-x-1/2">
          <ChevronUp className="h-5 w-5 animate-pulse text-muted-foreground/60" />
        </div>
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2">
          <ChevronDown className="h-5 w-5 animate-pulse text-muted-foreground/60" />
        </div>

        {/* active selector lane */}
        <div className="pointer-events-none absolute inset-x-3 top-1/2 z-0 h-[372px] -translate-y-1/2 rounded-2xl border-y-2 border-amber-400/70 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-500/5" />

        {/* the three drums */}
        <div
          className="relative z-10 grid h-[600px] grid-cols-3 gap-3"
          style={{ perspective: "1100px" }}
        >
          {top3.map((match, index) => (
            <ReelColumn
              key={match.tender.id}
              focus={match}
              rank={index}
              ghostsAbove={pick(index, 2)}
              ghostsBelow={pick(index + 1, 2)}
              isSelected={selectedId === match.tender.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
