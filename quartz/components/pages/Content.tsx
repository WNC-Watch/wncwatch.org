import { ComponentChildren } from "preact"
import { Element, ElementContent, Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

// A body block is a component drawn inside the article from data, in a
// position the block declares, so the author writes no marker for it.
//   "top":          before the first element of the body
//   "afterOpening": after the first top-level paragraph (the opening), or at
//                   the top when the body has none
//   "bottom":       after the last element
//   "opening":      in place of the first top-level paragraph, which the block
//                   has read and re-rendered (or at the top when there is none)
// A block that returns null draws nothing.
export type BodyBlock = {
  name: string
  placement: "top" | "afterOpening" | "opening" | "bottom"
  render: (props: QuartzComponentProps) => Element | null
}

interface ContentOptions {
  blocks: BodyBlock[]
}

const defaultOptions: ContentOptions = { blocks: [] }

export function renderBlocks(blocks: BodyBlock[], props: QuartzComponentProps) {
  return blocks
    .map((block) => ({ block, node: block.render(props) }))
    .filter((b): b is { block: BodyBlock; node: Element } => b.node !== null)
}

export function withBlocks(tree: Root, blocks: { block: BodyBlock; node: Element }[]): Root {
  if (blocks.length === 0) return tree
  const children: ElementContent[] = [...(tree.children as ElementContent[])]
  const firstParagraph = children.findIndex((c) => c.type === "element" && c.tagName === "p")
  // insert in declared order; later blocks in the same position follow earlier ones
  const at = { top: 0, afterOpening: firstParagraph === -1 ? 0 : firstParagraph + 1, bottom: children.length }
  const placed: Record<string, Element[]> = { top: [], afterOpening: [], opening: [], bottom: [] }
  for (const { block, node } of blocks) placed[block.placement].push(node)
  // splice from the back so earlier indexes stay valid
  children.splice(at.bottom, 0, ...placed.bottom)
  children.splice(at.afterOpening, 0, ...placed.afterOpening)
  if (placed.opening.length > 0) {
    if (firstParagraph === -1) children.splice(0, 0, ...placed.opening)
    else children.splice(firstParagraph, 1, ...placed.opening)
  }
  children.splice(at.top, 0, ...placed.top)
  return { ...tree, children }
}

export default ((opts?: Partial<ContentOptions>) => {
  const options: ContentOptions = { ...defaultOptions, ...opts }
  const Content: QuartzComponent = (props: QuartzComponentProps) => {
    const { fileData, tree } = props
    const body = withBlocks(tree as Root, renderBlocks(options.blocks, props))
    const content = htmlToJsx(fileData.filePath!, body) as ComponentChildren
    const classes: string[] = fileData.frontmatter?.cssclasses ?? []
    const classString = ["popover-hint", ...classes].join(" ")
    return <article class={classString}>{content}</article>
  }
  return Content
}) satisfies QuartzComponentConstructor<Partial<ContentOptions> | undefined>
