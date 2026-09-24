import { Element, ElementContent, Text } from "hast"
import { QuartzComponentProps } from "../types"
import { BodyBlock } from "../pages/Content"
import { resolveRelative } from "../../util/path"
import { AGENDA_LABEL, formatDate, loadCalendar, todayISO } from "../../plugins/transformers/calendar"
import { labelTable } from "../../plugins/transformers/tables"

// Region board: the homepage table of communities, rendered from the same
// data the area lead draws (each area page's `standing`, `systems` with their
// `kind`, and calendar.yml), so the board and the area pages cannot disagree.
// Replaces the <div class="avl-board"> slot on any page that carries it. Row order is the
// list below; an area page's optional `board_label` names the row (Watauga
// County's row reads "Boone + App State"). A row with nothing to show is omitted.

const ORDER = [
  "WNC/Transylvania-County",
  "WNC/Hendersonville",
  "WNC/Henderson-County",
  "WNC/Asheville",
  "WNC/Buncombe-County",
  "WNC/Watauga-County",
  "WNC/Macon-County",
  "WNC/Haywood-County",
  "WNC/Madison-County",
  "WNC/Jackson-County",
  "WNC/Rutherford-County",
  "WNC/McDowell-County",
]
const HEAD = ["Community", "Systems", "Where it stands", "Next"]
const KINDS = new Set(["expand", "resist", "future"])

const text = (value: string): Text => ({ type: "text", value })
function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}

export const RegionBoard: BodyBlock = {
  name: "region-board",
  placement: "slot",
  slot: "avl-board",
  render({ fileData, allFiles, ctx }: QuartzComponentProps): Element | null {
    // renders wherever a page leaves the slot: the homepage and the WNC overview
    const { items } = loadCalendar(ctx.argv.directory)
    const today = todayISO()
    const rows: Element[] = []
    for (const areaSlug of ORDER) {
      const page = allFiles.find((f) => f.slug === `${areaSlug}/index`)
      if (!page) continue
      const fm = (page.frontmatter ?? {}) as Record<string, unknown>
      const label = typeof fm.board_label === "string" ? fm.board_label : page.frontmatter?.title ?? areaSlug
      const systems = Array.isArray(fm.systems) ? (fm.systems as { vendor?: string; kind?: string }[]) : []
      const standing = typeof fm.standing === "string" ? fm.standing.trim() : ""
      const pageKey = `${areaSlug}/index`.replace(/-/g, " ")
      const next = items.find((it) => it.page && it.page.replace(/-/g, " ") === pageKey && it.date >= today)
      if (systems.length === 0 && !standing && !next) continue

      const sysCell: ElementContent[] = []
      systems.forEach((sy, i) => {
        if (!sy?.vendor) return
        if (i > 0) sysCell.push(el("br", {}, []))
        if (sy.kind && KINDS.has(sy.kind)) sysCell.push(el("span", { className: ["bd-dot", `bd-${sy.kind}`] }, []))
        sysCell.push(text(sy.vendor))
      })
      const nextCell: ElementContent[] = []
      if (next) {
        const dateText = formatDate(next.date, next.date.slice(0, 4) !== today.slice(0, 4)).replace(/^[A-Za-z]+, /, "")
        nextCell.push(next.agenda_url ? el("a", { href: next.agenda_url }, [text(dateText)]) : text(dateText))
        if (next.body) nextCell.push(text(`: ${next.body}`))
        if (next.status !== "held" && next.camera_item && AGENDA_LABEL[next.camera_item]) {
          nextCell.push(el("br", {}, []), el("span", { className: ["bd-agenda"] }, [text(AGENDA_LABEL[next.camera_item])]))
        }
      }
      rows.push(
        el("tr", {}, [
          el("td", { className: ["bd-place"] }, [
            el("a", { href: resolveRelative(fileData.slug!, page.slug!), className: ["internal"] }, [text(label)]),
          ]),
          el("td", { className: ["bd-systems"] }, sysCell),
          el("td", {}, [text(standing)]),
          el("td", { className: ["bd-next"] }, nextCell),
        ]),
      )
    }
    if (rows.length === 0) return null
    const table = el("table", {}, [el("tr", {}, HEAD.map((h) => el("th", {}, [text(h)]))), ...rows])
    // column labels for the phone layout, where each community becomes a card
    labelTable(table, 0)
    return el("div", { className: ["avl-board"] }, [table])
  },
}
