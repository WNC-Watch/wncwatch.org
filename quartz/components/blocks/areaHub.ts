import { Element, ElementContent, Text } from "hast"
import { QuartzPluginData } from "../../plugins/vfile"
import { FullSlug, resolveRelative } from "../../util/path"
import { QuartzComponentProps } from "../types"
import { BodyBlock } from "../pages/Content"

// Area hub: on an area page (WNC/<Area>/index) renders the same grouping the
// left nav shows, so a reader who arrives by search or from a post sees the
// area's officials, record chapters, community profiles, meeting records
// and remaining pages without opening the explorer. Renders data only: a
// group with no pages renders nothing; an area with nothing to list renders
// nothing. Labels live here, in one place.

const LABELS = {
  officials: "Officials",
  record: "Record",
  community: "Community",
  meetings: "Meetings",
  other: "Other pages",
}

const text = (value: string): Text => ({ type: "text", value })
function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children }
}

const byTitle = (a: QuartzPluginData, b: QuartzPluginData) =>
  (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "", undefined, {
    numeric: true,
    sensitivity: "base",
  })

function pagesUnder(allFiles: QuartzPluginData[], folder: string): QuartzPluginData[] {
  // direct children of `folder` (a slug prefix ending in "/"), index excluded
  return allFiles.filter((f) => {
    const s = f.slug ?? ""
    if (!s.startsWith(folder)) return false
    const rest = s.slice(folder.length)
    return rest.length > 0 && !rest.includes("/") && rest !== "index"
  })
}

function group(label: string, pages: QuartzPluginData[], current: FullSlug): Element | null {
  if (pages.length === 0) return null
  return el("div", { className: ["hub-group"] }, [
    el("span", { className: ["hub-label"] }, [text(label)]),
    el(
      "ul",
      {},
      pages.map((p) =>
        el("li", {}, [
          el("a", { href: resolveRelative(current, p.slug!), className: ["internal"] }, [
            text(p.frontmatter?.title ?? p.slug!),
          ]),
        ]),
      ),
    ),
  ])
}

export const AreaHub: BodyBlock = {
  name: "area-hub",
  placement: "afterOpening",
  render({ fileData, allFiles }: QuartzComponentProps): Element | null {
    const slug = fileData.slug!
    const parts = slug.split("/")
    if (parts.length !== 3 || parts[0] !== "WNC" || parts[2] !== "index") return null
    const area = parts[1]
    const prefix = `WNC/${area}/`

    const officials = pagesUnder(allFiles, `${prefix}Officials/`).sort(byTitle)
    const record = pagesUnder(allFiles, `${prefix}Record/`).sort(byTitle)
    const community = pagesUnder(allFiles, `${prefix}Community/`).sort(byTitle)
    // meeting records live under Meetings/ and carry the town as their folder
    const meetings = pagesUnder(allFiles, `Meetings/${area}/`).sort(byTitle).reverse()
    const known = new Set(["Officials", "Record", "Community"])
    const other = pagesUnder(allFiles, prefix)
      .filter((f) => !known.has(f.slug!.slice(prefix.length)))
      .sort(byTitle)

    const groups = [
      group(LABELS.officials, officials, slug),
      group(LABELS.record, record, slug),
      group(LABELS.community, community, slug),
      group(LABELS.meetings, meetings, slug),
      group(LABELS.other, other, slug),
    ].filter((g): g is Element => g !== null)
    if (groups.length === 0) return null

    return el("nav", { className: ["area-hub"], ariaLabel: `Pages for ${area.replace(/-/g, " ")}` }, groups)
  },
}
