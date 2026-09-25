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

// ── The regional timeline ────────────────────────────────────────────────
//   <div class="avl-tl" data-events="region"></div>
// Every event once (rows marked same_as another row are that row's twin),
// ahead items first in date order, then the rest newest first, grouped by
// year, each with its area. Filters (area, kind) are wired by the
// RegionTimeline component's script; without script every item shows.

// Asheville Timeline rows are markdown; the feed needs them as HTML.
function mdInline(s: string): string {
  const slug = (x: string) => x.trim().replace(/ /g, "-")
  const anchor = (x: string) =>
    x.trim().toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-")
  const target = (x: string) => {
    const [page, hash] = x.split("#")
    return "./" + slug(page) + (hash ? "#" + anchor(hash) : "")
  }
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_m, a, b) => `<a href="${target(a)}">${b}</a>`)
    .replace(/\[\[([^\]]+)\]\]/g, (_m, a) => `<a href="${target(a)}">${a.split("/").pop()}</a>`)
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_m, a, b) => `<a href="${b}">${a}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
}

function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date())
}

const AREA_LABEL = (a: string) => (a === "region" ? "Region" : a)

function renderRegion(events: EventItem[]): string {
  const today = todayISO()
  const rows = events.filter((e) => !e.same_as && (e.summary !== undefined || e.full !== undefined))
  const item = (e: EventItem) => {
    const areas = (e.area ?? []).map(AREA_LABEL)
    const body = e.summary !== undefined ? e.summary : " " + mdInline(e.full ?? "")
    const html = renderEvent({ ...e, summary: body }).replace(
      '<div class="tl-date">',
      `<div class="tl-date"><span class="tl-area">${areas.join(" · ")}</span>`,
    )
    return html.replace(
      '<div class="tl-item ',
      `<div data-area="${areas.join("|")}" data-kind="${e.kind}" class="tl-item `,
    )
  }
  const ahead = rows
    .filter((e) => (e.date ?? "") > today)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
  const past = rows
    .filter((e) => (e.date ?? "") <= today)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  const areas = [...new Set(rows.flatMap((e) => (e.area ?? []).map(AREA_LABEL)))].sort((a, b) =>
    a === "Region" ? -1 : b === "Region" ? 1 : a.localeCompare(b),
  )
  const kinds: [string, string][] = [
    ["", "All"],
    ["built", "Built"],
    ["changed", "Changed"],
    ["reported", "Reported"],
    ["ahead", "Ahead"],
  ]
  const out: string[] = []
  out.push(
    '<div class="tl-filters" data-tl-filters>' +
      '<label class="tl-filter-area">Area <select data-tl-area><option value="">All areas</option>' +
      areas.map((a) => `<option value="${a}">${a}</option>`).join("") +
      "</select></label>" +
      '<div class="tl-filter-kinds" role="group" aria-label="Kind">' +
      kinds
        .map(([k, l]) => `<button type="button" data-tl-kind="${k}" aria-pressed="${k === "" ? "true" : "false"}">${l}</button>`)
        .join("") +
      "</div></div>",
  )
  if (ahead.length) {
    out.push('<p class="tl-era" data-tl-group>Ahead</p>', '<div class="avl-tl">', ...ahead.map(item), "</div>")
  }
  let year = ""
  for (const e of past) {
    const y = (e.date ?? "").slice(0, 4) || "Undated"
    if (y !== year) {
      if (year) out.push("</div>")
      out.push(`<p class="tl-era" data-tl-group>${y}</p>`, '<div class="avl-tl">')
      year = y
    }
    out.push(item(e))
  }
  if (year) out.push("</div>")
  return `<div class="tl-region">\n${out.join("\n")}\n</div>`
}

// ── Latest, for the homepage ─────────────────────────────────────────────
//   <div class="avl-tl" data-events="latest:6"></div>
// The most recent events region-wide (dated today or earlier), newest first,
// one line each: date, area, kind, and the headline linked to the meeting
// record when there is one, else to the area page.
function renderLatest(events: EventItem[], n: number): string {
  const today = todayISO()
  const rows = events
    .filter((e) => !e.same_as && (e.date ?? "") !== "" && (e.date ?? "") <= today && e.title)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, n)
  const areaHref = (a: string) =>
    a === "region" ? "./WNC/index" : `./WNC/${a.replace(/ /g, "-")}/index`
  const li = rows.map((e) => {
    const area = (e.area ?? [])[0] ?? "region"
    const href = e.record ? "./" + e.record.replace(/ /g, "-") : areaHref(area)
    const word = KIND_WORD[e.kind] ? ` · ${KIND_WORD[e.kind]}` : ""
    return (
      `<li class="${KIND_CLASS[e.kind] ?? "tl-none"}"><span class="latest-meta">${e.date_label} · ${AREA_LABEL(area)}${word}</span>` +
      `<a href="${href}">${e.title}</a></li>`
    )
  })
  return `<ul class="avl-latest">\n${li.join("\n")}\n</ul>`
}

const MARKER = /<div class="avl-tl" data-events="([^"]+)"><\/div>/g

export const Events: QuartzTransformerPlugin = () => {
  return {
    name: "Events",
    textTransform(ctx, src) {
      if (!src.includes("data-events=")) return src
      const events = loadEvents(ctx.argv.directory)
      return src.replace(MARKER, (_m, page: string) => {
        if (page === "region") return renderRegion(events)
        if (page.startsWith("latest:")) return renderLatest(events, Number(page.slice(7)) || 6)
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
