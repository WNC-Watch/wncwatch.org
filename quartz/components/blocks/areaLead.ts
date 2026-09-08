import { Element, ElementContent, Text } from "hast"
import { QuartzComponentProps } from "../types"
import { BodyBlock } from "../pages/Content"
import { AGENDA_LABEL, CalendarItem, formatDate, loadCalendar, todayISO } from "../../plugins/transformers/calendar"

// Area lead: the first thing on an area page (WNC/<Area>/index). Three lines
// drawn from data: where the community stands (frontmatter `standing`, with
// `standing_kind` expand | resist | future for the colour the timelines use),
// the system in place (frontmatter `system`), and the area's next dates from
// calendar.yml (items whose `page` is this page, today or later, up to three).
// A missing field renders no line; a page with none of the three renders nothing.

const LABELS = { standing: "Where it stands", system: "The system", next: "Next" }
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
  render({ fileData, ctx }: QuartzComponentProps): Element | null {
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
    const system = typeof fm.system === "string" ? fm.system.trim() : ""
    if (system) rows.push(row(LABELS.system, [text(system)]))

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
