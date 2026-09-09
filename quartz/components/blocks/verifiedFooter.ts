import { Element, ElementContent } from "hast"
import { QuartzComponentProps } from "../types"
import { BodyBlock } from "../pages/Content"
import { resolveRelative, FullSlug, simplifySlug } from "../../util/path"

// Verified footer: renders "Region: <area> · Last verified: <date>" at the foot
// of a page from the frontmatter field `verified` (an ISO date). The date means
// the day every field in the page's status strip (the area lead or the office
// block) was checked against its named source (ruled 2026-09-04). A page without
// `verified` renders no footer and carries no date. The region is the area
// folder the page sits in (WNC/<Area>/...), linked to that area's page; area
// pages themselves and pages outside an area folder show only the date.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}
const text = (value: string): ElementContent => ({ type: "text", value })

function longDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  return `${MONTHS[parseInt(m[2], 10) - 1]} ${parseInt(m[3], 10)}, ${m[1]}`
}

export const VerifiedFooter: BodyBlock = {
  name: "verified-footer",
  placement: "bottom",
  render({ fileData, allFiles }: QuartzComponentProps): Element | null {
    const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>
    const raw = fm.verified
    const iso = raw instanceof Date ? raw.toISOString().slice(0, 10) : typeof raw === "string" ? raw.trim() : ""
    if (!iso) return null
    const date = longDate(iso)
    if (!date) {
      console.warn(`verified-footer: ${fileData.slug} has a non-ISO verified date "${iso}"`)
      return null
    }
    const slug = fileData.slug ?? ""
    const children: ElementContent[] = []
    const m = /^WNC\/([^/]+)\/(?!index$).+/.exec(slug)
    if (m) {
      const areaSlug = `WNC/${m[1]}/index` as FullSlug
      const area = allFiles.find((f) => f.slug === areaSlug)
      const label = area?.frontmatter?.title ?? m[1].replace(/-/g, " ")
      children.push(
        text("Region: "),
        el("a", { href: resolveRelative(slug as FullSlug, simplifySlug(areaSlug)), className: ["internal"] }, [text(String(label))]),
        text(" · "),
      )
    }
    children.push(text(`Last verified: ${date}`))
    return el("p", { className: ["block", "verified"] }, [el("em", {}, children)])
  },
}
