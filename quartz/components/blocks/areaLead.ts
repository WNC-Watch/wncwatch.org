import { Element, ElementContent, Text } from "hast"
import { QuartzComponentProps } from "../types"
import { resolveRelative } from "../../util/path"
import { BodyBlock } from "../pages/Content"
import { AGENDA_LABEL, CalendarItem, formatDate, loadCalendar, todayISO } from "../../plugins/transformers/calendar"

// Area lead: the first thing on an area page (WNC/<Area>/index). Three rows
// drawn from data: where the community stands (frontmatter `standing`, with
// `standing_kind` expand | resist | future for the colour the timelines use);
// the systems in place, one line per vendor (frontmatter `systems`, a list of
// {vendor, detail, links}, links being content paths whose titles render as
// the line's links; a plain `system` string is the fallback); and the area's
// next dates from calendar.yml (items whose `page` is this page, today or
// later, up to three). A missing field renders no row; a page with none of
// the three renders nothing.

const LABELS = { standing: "Where it stands", system: "The systems", next: "Next" }
type SystemEntry = { vendor?: string; detail?: string; links?: string[] }
const KINDS = new Set(["expand", "resist", "future"])
const MAX_NEXT = 3

const text = (value: string): Text => ({ type: "text", value })
function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}
function row(label: string, value: ElementContent[]): Element {
  return el("div", { className: ["lead-row"] }, [el("span", { className: ["lead-k"] }, [text(label)]), ...value])
}

function nextLine(item: CalendarItem, today: string): Element {
  const withYear = item.date.slice(0, 4) !== today.slice(0, 4)
  const dateText = formatDate(item.date, withYear)
  const children: ElementContent[] = [
    el("strong", {}, [item.agenda_url ? el("a", { href: item.agenda_url }, [text(dateText)]) : text(dateText)]),
  ]
  let tail = ""
  if (item.time) tail += `, ${item.time}`
  if (item.body) tail += `: ${item.body}`
  tail += "."
  if (item.status !== "held" && item.camera_item && AGENDA_LABEL[item.camera_item]) tail += ` ${AGENDA_LABEL[item.camera_item]}`
  children.push(text(tail))
  return el("li", {}, children)
}

export const AreaLead: BodyBlock = {
  name: "area-lead",
  placement: "top",
  render({ fileData, ctx, allFiles }: QuartzComponentProps): Element | null {
    const slug = fileData.slug ?? ""
    const parts = slug.split("/")
    if (parts.length !== 3 || parts[0] !== "WNC" || parts[2] !== "index") return null
    const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>
    const rows: Element[] = []

    const standing = typeof fm.standing === "string" ? fm.standing.trim() : ""
    if (standing) {
      const kind = typeof fm.standing_kind === "string" && KINDS.has(fm.standing_kind) ? fm.standing_kind : undefined
      const value: ElementContent[] = []
      if (kind) value.push(el("span", { className: ["bd-dot", `bd-${kind}`] }, []))
      value.push(text(standing))
      rows.push(row(LABELS.standing, value))
    }
    if (Array.isArray(fm.systems) && fm.systems.length > 0) {
      const lines: Element[] = []
      for (const raw of fm.systems as SystemEntry[]) {
        if (!raw || typeof raw !== "object") continue
        const children: ElementContent[] = []
        if (raw.vendor) children.push(el("strong", {}, [text(`${raw.vendor.trim()}.`)]), text(" "))
        if (raw.detail) children.push(text(raw.detail.trim()))
        const links: ElementContent[] = []
        for (const target of raw.links ?? []) {
          const want = String(target).replace(/ /g, "-")
          const f = allFiles.find((x) => x.slug === want || x.slug === `${want}/index`)
          if (!f) {
            console.warn(`Area lead: ${slug} links to "${target}", which is not a page`)
            continue
          }
          if (links.length > 0) links.push(text(" · "))
          links.push(el("a", { href: resolveRelative(fileData.slug!, f.slug!), className: ["internal"] }, [text(f.frontmatter?.title ?? target)]))
        }
        if (links.length > 0) children.push(text(" "), el("span", { className: ["lead-links"] }, links))
        if (children.length > 0) lines.push(el("li", {}, children))
      }
      if (lines.length > 0) rows.push(row(LABELS.system, [el("ul", {}, lines)]))
    } else {
      const system = typeof fm.system === "string" ? fm.system.trim() : ""
      if (system) rows.push(row(LABELS.system, [text(system)]))
    }

    const { items } = loadCalendar(ctx.argv.directory)
    const today = todayISO()
    const pageKey = slug.replace(/-/g, " ")
    const next = items
      .filter((it) => it.page && it.page.replace(/-/g, " ") === pageKey && it.date >= today)
      .slice(0, MAX_NEXT)
    if (next.length > 0) rows.push(row(LABELS.next, [el("ul", {}, next.map((it) => nextLine(it, today)))]))

    if (rows.length === 0) return null
    return el("div", { className: ["area-lead"] }, rows)
  },
}
