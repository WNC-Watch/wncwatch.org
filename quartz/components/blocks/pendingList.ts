import { Element, ElementContent } from "hast"
import { QuartzComponentProps } from "../types"
import { BodyBlock } from "../pages/Content"
import { FullSlug, resolveRelative } from "../../util/path"

// What is pending: every tracker page whose frontmatter status is "pending",
// title linked and its one-line description, drawn where a page leaves
// <div class="avl-pending"></div>. Changes when a tracker's status does, so
// it cannot go stale the way a hand-kept list does.

function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: "element", tagName, properties, children } as Element
}
const text = (value: string): ElementContent => ({ type: "text", value })

export const PendingList: BodyBlock = {
  name: "pending-list",
  placement: "slot",
  slot: "avl-pending",
  render({ fileData, allFiles }: QuartzComponentProps): Element | null {
    const here = fileData.slug as FullSlug
    const pending = allFiles
      .filter((f) => f.frontmatter?.type === "tracker" && f.frontmatter?.status === "pending")
      .sort((a, b) => String(a.frontmatter?.title).localeCompare(String(b.frontmatter?.title)))
    if (pending.length === 0) return null
    const items = pending.map((f) => {
      const area = ((f.frontmatter?.area as string[] | undefined) ?? [])[0]
      const children: ElementContent[] = [
        el("a", { href: resolveRelative(here, f.slug as FullSlug), className: ["internal"] }, [
          text(String(f.frontmatter?.title)),
        ]),
      ]
      if (area) children.push(el("span", { className: ["pending-area"] }, [text(area)]))
      const desc = String(f.frontmatter?.description ?? "")
      if (desc) children.push(el("span", { className: ["pending-desc"] }, [text(desc)]))
      return el("li", {}, children)
    })
    return el("ul", { className: ["avl-pending"] }, items)
  },
}
