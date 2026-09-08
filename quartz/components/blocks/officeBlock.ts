import { Element, ElementContent, Text } from "hast"
import { toString } from "hast-util-to-string"
import { QuartzComponentProps } from "../types"
import { BodyBlock } from "../pages/Content"

// Office block: on an official's page (WNC/<Area>/Officials/<Name>,
// WNC/Raleigh-and-Washington/<Name>, Companies/People/<Name>) the page opens
// with a run of "**Label:** value" lines. This block recognizes that opening
// paragraph and renders it as one component, a definition list, keeping every
// label and value exactly as written. It moves no data and writes nothing the
// author did not; it gives the office facts one markup and one style so a later
// field move can render into the same component. A page whose opening is not
// such a run is left alone. Labels outside ALLOWED are rendered as written and
// reported at build time so the list can go to Benjamin.

const ALLOWED = new Set([
  "Title",
  "In this role since",
  "Current term ends",
  "Term ends",
  "Term",
  "The seat",
  "Next voter decision",
  "Next meeting where he acts",
  "Next meeting where she acts",
])

const OFFICIAL_PATHS = [/^WNC\/[^/]+\/Officials\/[^/]+$/, /^WNC\/Raleigh-and-Washington\/[^/]+$/, /^Companies\/People\/[^/]+$/]

function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}

type Row = { label: string; value: ElementContent[] }

// Split a paragraph's children into rows at line breaks (a text node holding a
// newline, or a <br>). Each row must open with <strong>Label:</strong>.
function rowsOf(p: Element): Row[] | null {
  const lines: ElementContent[][] = [[]]
  for (const child of p.children) {
    if (child.type === "element" && child.tagName === "br") {
      lines.push([])
      continue
    }
    if (child.type === "text" && child.value.includes("\n")) {
      const parts = child.value.split("\n")
      parts.forEach((part, i) => {
        if (i > 0) lines.push([])
        if (part) lines[lines.length - 1].push({ type: "text", value: part } as Text)
      })
      continue
    }
    lines[lines.length - 1].push(child)
  }
  const rows: Row[] = []
  for (const line of lines) {
    const trimmed = line.filter((n) => !(n.type === "text" && n.value.trim() === ""))
    if (trimmed.length === 0) continue
    const first = trimmed[0]
    if (first.type !== "element" || first.tagName !== "strong") return null
    const label = toString(first).trim()
    if (!label.endsWith(":")) return null
    const value = trimmed.slice(1)
    // drop the leading space after the colon
    if (value[0]?.type === "text") {
      const t = value[0] as Text
      value[0] = { ...t, value: t.value.replace(/^\s+/, "") }
    }
    rows.push({ label: label.slice(0, -1), value })
  }
  return rows.length > 0 ? rows : null
}

export const OfficeBlock: BodyBlock = {
  name: "office",
  placement: "opening",
  render({ fileData, tree }: QuartzComponentProps): Element | null {
    const slug = fileData.slug ?? ""
    if (!OFFICIAL_PATHS.some((re) => re.test(slug))) return null
    const root = tree as { children: ElementContent[] }
    const first = root.children.find((c) => c.type === "element") as Element | undefined
    if (!first || first.tagName !== "p") return null
    const rows = rowsOf(first)
    if (!rows) return null
    for (const r of rows) {
      if (!ALLOWED.has(r.label)) {
        console.warn(`Office block: ${slug} has a field label outside the allowed set: "${r.label}"`)
      }
    }
    return el(
      "dl",
      { className: ["office"] },
      rows.map((r) =>
        el("div", { className: ["office-row"] }, [
          el("dt", {}, [{ type: "text", value: r.label } as Text]),
          el("dd", {}, r.value),
        ]),
      ),
    )
  },
}
