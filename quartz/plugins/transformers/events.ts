import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import { styleText } from "util"
import { QuartzTransformerPlugin } from "../types"

// Events: the region's timeline entries, kept as data in events.yml (site root,
// next to calendar.yml) and drawn into pages before the markdown is parsed.
//
//   <div class="avl-tl" data-events="WNC/Henderson County/index"></div>
//     replaced with the timeline block for that page: every event whose `page`
//     is that page, in date order, one line of HTML per event, the same markup
//     the area pages carried by hand before 2026-09-24.
//
// An event is written to the standard in the ops repo
// (campaigns/2026-09-regional-tracker/EVENT-LINES.md): a headline that stands
// alone, an optional detail line, and a kind shown as a word beside its color.

export interface EventItem {
  id: string
  page: string
  order?: number
  area?: string[]
  date?: string
  date_label: string
  kind: "built" | "changed" | "reported" | "ahead" | "none"
  now?: boolean
  title?: string
  summary?: string
  full?: string
  same_as?: string
  record?: string
  kind_word?: boolean
}

const KIND_CLASS: Record<string, string> = {
  built: "tl-expand",
  changed: "tl-resist",
  ahead: "tl-future",
  reported: "tl-report",
  none: "tl-none",
}
const KIND_WORD: Record<string, string> = {
  built: "Built",
  changed: "Changed",
  ahead: "Ahead",
  reported: "Reported",
  none: "",
}

let cache: EventItem[] | undefined

function warn(msg: string) {
  console.warn(styleText("yellow", `Warning: Events: ${msg}`))
}

export function loadEvents(contentDir: string): EventItem[] {
  if (cache) return cache
  const candidates = [
    path.resolve(contentDir, "..", "events.yml"),
    path.resolve(process.cwd(), "events.yml"),
  ]
  const file = candidates.find((p) => fs.existsSync(p))
  if (!file) {
    warn("events.yml not found; timeline blocks left empty")
    cache = []
    return cache
  }
  const raw = yaml.load(fs.readFileSync(file, "utf8"))
  cache = Array.isArray(raw) ? (raw as EventItem[]) : []
  return cache
}

// A meeting that has its own page gets a link to it after the detail line.
// The href climbs from the area page (WNC/<Area>/index) to the site root.
function recordLink(e: EventItem): string {
  if (!e.record) return ""
  const href = "../" + e.record.replace(/ /g, "-")
  return ` <a href="${href}" class="internal tl-record">Meeting record</a>`
}

export function renderEvent(e: EventItem): string {
  const cls = KIND_CLASS[e.kind] ?? "tl-none"
  const word = e.kind_word === false ? "" : KIND_WORD[e.kind] ?? ""
  const kindSpan = word ? `<span class="tl-kind">${word}</span>` : ""
  const head = e.title ? `<strong class="tl-head">${e.title}</strong>` : ""
  return (
    `<div class="tl-item ${cls}${e.now ? " tl-now" : ""}">` +
    `<div class="tl-date">${e.date_label}${kindSpan}</div>` +
    `<div class="tl-body">${head}${e.summary ?? ""}${recordLink(e)}</div></div>`
  )
}

const MARKER = /<div class="avl-tl" data-events="([^"]+)"><\/div>/g

export const Events: QuartzTransformerPlugin = () => {
  return {
    name: "Events",
    textTransform(ctx, src) {
      if (!src.includes("data-events=")) return src
      const events = loadEvents(ctx.argv.directory)
      return src.replace(MARKER, (_m, page: string) => {
        const rows = events
          .filter((e) => e.page === page && e.summary !== undefined)
          .map((e, i) => ({ e, i }))
          .sort(
            (a, b) =>
              (a.e.date ?? "").localeCompare(b.e.date ?? "") ||
              (a.e.order ?? a.i) - (b.e.order ?? b.i),
          )
          .map(({ e }) => renderEvent(e))
        if (rows.length === 0) warn(`no events for page "${page}"`)
        return `<div class="avl-tl">\n${rows.join("\n")}\n</div>`
      })
    },
  }
}
