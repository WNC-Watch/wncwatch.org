import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import { Root, Element, ElementContent, Text } from "hast"
import { visit } from "unist-util-visit"
import { styleText } from "util"
import { QuartzTransformerPlugin } from "../types"

// Calendar: renders items from the site's calendar.yml (site root, next to
// quartz.config.ts) into the HTML tree of every page.
//
//   <span data-cal="ITEM-ID"></span>
//     replaced with one inline unit: weekday, date (linked to the agenda
//     when there is one), time, body, venue and address, and the comment
//     procedure when present. An unknown id leaves the span in place and
//     prints a warning.
//
//   <div data-cal="ITEM-ID"></div>
//     the card form of the same item: date, time, place, body and the comment
//     procedure each on its own line, for a page section about one meeting.
//
//   <div data-cal-list="area:WNC/Asheville/index"></div>
//     the same list for one area (items whose page is that page) plus the
//     labeled dates.
//
//   <div data-cal-list="upcoming"></div>
//     replaced with <ul class="cal-list"> holding every item dated today
//     (America/New_York) or later, sorted by date, each <li> the same unit
//     plus "Held." for a held item and the item's note.

export interface CalendarItem {
  id: string
  area?: string
  body?: string
  date: string
  time?: string
  venue?: string
  address?: string
  comment?: string
  agenda_url?: string
  source_url?: string
  camera_item?: string
  status?: string
  note?: string
  verify_note?: string
  verified?: string
  page?: string
  label?: string
  account_url?: string
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "Sept",
  "October",
  "November",
  "December",
]
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

let cache: { items: CalendarItem[]; byId: Map<string, CalendarItem> } | undefined

function warn(msg: string) {
  console.warn(styleText("yellow", `Warning: Calendar: ${msg}`))
}

export function loadCalendar(contentDir: string) {
  if (cache) return cache
  const candidates = [
    path.resolve(contentDir, "..", "calendar.yml"),
    path.resolve(process.cwd(), "calendar.yml"),
  ]
  const file = candidates.find((p) => fs.existsSync(p))
  const items: CalendarItem[] = []
  if (!file) {
    warn(`calendar.yml not found (looked in ${candidates.join(", ")}); calendar units left unrendered`)
  } else {
    const raw = yaml.load(fs.readFileSync(file, "utf8"))
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (!entry || typeof entry !== "object" || !entry.id || !entry.date) {
          warn(`skipping a calendar.yml item without an id or date: ${JSON.stringify(entry)}`)
          continue
        }
        const item: CalendarItem = { ...entry, id: String(entry.id) }
        // js-yaml turns an unquoted YYYY-MM-DD into a Date; keep the ISO day
        item.date =
          entry.date instanceof Date ? entry.date.toISOString().slice(0, 10) : String(entry.date)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
          warn(`item ${item.id} has a date that is not YYYY-MM-DD (${item.date}); skipped`)
          continue
        }
        items.push(item)
      }
    } else {
      warn(`calendar.yml is not a list; calendar units left unrendered`)
    }
  }
  items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  const byId = new Map<string, CalendarItem>()
  for (const it of items) {
    if (byId.has(it.id)) warn(`duplicate id ${it.id}; the later item wins`)
    byId.set(it.id, it)
  }
  cache = { items, byId }
  return cache
}

export function todayISO(): string {
  // The build may run in a UTC container; the calendar is on Eastern time.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

export function formatDate(iso: string, withYear: boolean): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10))
  const dt = new Date(y, m - 1, d)
  const base = `${WEEKDAYS[dt.getDay()]}, ${MONTHS[m - 1]} ${d}`
  return withYear ? `${base}, ${y}` : base
}

const text = (value: string): Text => ({ type: "text", value })

function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}

function endsWithStop(s: string): boolean {
  return /[.!?]$/.test(s.trim())
}

export function place(item: CalendarItem): string | undefined {
  const venue = item.venue?.trim()
  const address = item.address?.trim()
  if (venue && address) {
    if (address.includes(venue)) return address
    if (venue.includes(address)) return venue
    // keep only the venue segments the address does not already carry
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
    const addr = norm(address)
    const kept = venue
      .split(/,\s*/)
      .map((seg) => seg.trim())
      .filter((seg) => seg && !addr.includes(norm(seg)))
    return kept.length ? `${kept.join(", ")}, ${address}` : address
  }
  return venue || address || undefined
}

// One inline unit: <span class="cal-unit"><strong><a>date</a></strong>, time: body, place. Comment.</span>
function renderUnit(item: CalendarItem, today: string): Element {
  const withYear = item.date.slice(0, 4) !== today.slice(0, 4)
  const dateText = formatDate(item.date, withYear)
  const dateNode: ElementContent = item.agenda_url
    ? el("a", { href: item.agenda_url }, [text(dateText)])
    : text(dateText)
  const children: ElementContent[] = [el("strong", {}, [dateNode])]

  let tail = ""
  if (item.time) tail += `, ${item.time}`
  if (item.body) tail += `: ${item.body}`
  const where = place(item)
  if (where) tail += `${item.body ? "," : ":"} ${where}`
  tail += "."
  if (item.comment) {
    const c = item.comment.trim()
    tail += ` ${c}${endsWithStop(c) ? "" : "."}`
  }
  children.push(text(tail))
  return el("span", { className: ["cal-unit"] }, children)
}

// The card form: one line per fact, the comment procedure last.
export function renderCard(item: CalendarItem, today: string): Element {
  const withYear = item.date.slice(0, 4) !== today.slice(0, 4)
  const dateText = formatDate(item.date, withYear)
  const rows: [string, ElementContent[]][] = []
  rows.push(["Date", [item.agenda_url ? el("a", { href: item.agenda_url }, [text(dateText)]) : text(dateText)]])
  if (item.time) rows.push(["Time", [text(item.time)]])
  if (item.body) rows.push(["Body", [text(item.body)]])
  const where = place(item)
  if (where) rows.push(["Place", [text(where)]])
  if (item.status !== "held" && item.camera_item && AGENDA_LABEL[item.camera_item]) {
    rows.push(["Agenda", [text(AGENDA_LABEL[item.camera_item])]])
  }
  if (item.comment) rows.push(["How to comment", [text(item.comment.trim())]])
  if (item.status === "held") {
    const held: ElementContent[] = [text("Held")]
    if (item.account_url) held.push(text("; "), el("a", { href: item.account_url }, [text("the account")]))
    held.push(text("."))
    rows.push(["Status", held])
  }
  return el(
    "dl",
    { className: ["block", "cal-card"] },
    rows.map(([k, v]) => el("div", { className: ["block-row"] }, [el("dt", {}, [text(k)]), el("dd", {}, v)])),
  )
}

export const AGENDA_LABEL: Record<string, string> = {
  yes: "Plate readers are on the posted agenda.",
  no: "No camera item on the posted agenda.",
  unknown: "Agenda not yet posted.",
}

// A short list line: area (linked to its page), then date, time, body, place, then the
// agenda status, then Held with the account link. The comment procedure and the note
// stay on the full unit, which the area pages render.
function renderListItem(item: CalendarItem, today: string, siteRoot: string): Element {
  const children: ElementContent[] = []
  if (item.area && item.area !== "North Carolina") {
    const name = text(item.area)
    children.push(
      item.page
        ? el("a", { href: `${siteRoot}${item.page.replace(/ /g, "-")}`, className: ["internal"] }, [name])
        : name,
    )
    children.push(text(": "))
  }
  const withYear = item.date.slice(0, 4) !== today.slice(0, 4)
  const dateText = formatDate(item.date, withYear)
  const dateNode: ElementContent = item.agenda_url
    ? el("a", { href: item.agenda_url }, [text(dateText)])
    : text(dateText)
  children.push(el("strong", {}, [dateNode]))
  if (item.label) {
    children.push(text(`: ${item.label}.`))
  } else {
    let tail = ""
    if (item.time) tail += `, ${item.time}`
    if (item.body) tail += `: ${item.body}`
    const where = item.address?.trim() || item.venue?.trim()
    if (where) tail += `, ${where}`
    tail += "."
    if (item.status !== "held" && item.camera_item && AGENDA_LABEL[item.camera_item]) {
      tail += ` ${AGENDA_LABEL[item.camera_item]}`
    }
    children.push(text(tail))
  }
  if (item.status === "held") {
    children.push(text(" Held"))
    if (item.account_url) {
      children.push(text("; "))
      children.push(el("a", { href: item.account_url }, [text("the account")]))
    }
    children.push(text("."))
  }
  if (item.note) {
    const n = item.note.trim()
    children.push(text(` ${n}${endsWithStop(n) ? "" : "."}`))
  }
  return el("li", {}, children)
}

// The homepage list shows each area's next item and every labeled item (the election dates).
function upcomingForList(items: CalendarItem[], today: string): CalendarItem[] {
  const seen = new Set<string>()
  const out: CalendarItem[] = []
  for (const it of items) {
    if (it.date < today) continue
    if (it.label) { out.push(it); continue }
    const key = it.area ?? it.id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

export const Calendar: QuartzTransformerPlugin = () => {
  return {
    name: "Calendar",
    htmlPlugins(ctx) {
      return [
        () => (tree: Root, file) => {
          const { items, byId } = loadCalendar(ctx.argv.directory)
          const today = todayISO()
          const page = file?.path ?? "(unknown page)"
          visit(tree, "element", (node: Element, index, parent) => {
            if (!parent || index === undefined) return
            const props = node.properties ?? {}

            if (node.tagName === "span" && typeof props.dataCal === "string") {
              const item = byId.get(props.dataCal)
              if (!item) {
                warn(`${page}: unknown calendar id "${props.dataCal}" in <span data-cal>, left as is`)
                return
              }
              parent.children[index] = renderUnit(item, today)
              return
            }

            if (node.tagName === "div" && typeof props.dataCal === "string") {
              const item = byId.get(props.dataCal)
              if (!item) {
                warn(`${page}: unknown calendar id "${props.dataCal}" in <div data-cal>, left as is`)
                return
              }
              parent.children[index] = renderCard(item, today)
              return
            }

            if (node.tagName === "div" && typeof props.dataCalList === "string" && props.dataCalList.startsWith("area:")) {
              // one area's upcoming items plus the labeled dates (elections)
              const pageKey = props.dataCalList.slice(5).replace(/-/g, " ")
              const scoped = items.filter(
                (it) => it.date >= today && (it.label || (it.page && it.page.replace(/-/g, " ") === pageKey)),
              )
              parent.children[index] = el(
                "ul",
                { className: ["cal-list"] },
                scoped.map((it) => renderListItem({ ...it, area: it.label ? it.area : undefined }, today, "/")),
              )
              return
            }

            if (node.tagName === "div" && props.dataCalList === "upcoming") {
              const upcoming = upcomingForList(items, today)
              const siteRoot = "/"
              const list = el(
                "ul",
                { className: ["cal-list"] },
                upcoming.map((it) => renderListItem(it, today, siteRoot)),
              )
              parent.children[index] = list
              return
            }
          })
        },
      ]
    },
  }
}
