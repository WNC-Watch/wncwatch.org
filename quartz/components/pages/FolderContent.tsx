import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

import style from "../styles/listPage.scss"
import { PageList, SortFn } from "../PageList"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { QuartzPluginData } from "../../plugins/vfile"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { trieFromAllFiles } from "../../util/ctx"
import { BodyBlock, renderBlocks, withBlocks } from "./Content"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"

interface FolderContentOptions {
  /**
   * Whether to display number of folders
   */
  showFolderCount: boolean
  showSubfolders: boolean
  sort?: SortFn
  // body blocks drawn inside the folder's index content (see Content.tsx)
  blocks: BodyBlock[]
}

const defaultOptions: FolderContentOptions = {
  showFolderCount: true,
  showSubfolders: true,
  blocks: [],
}

export default ((opts?: Partial<FolderContentOptions>) => {
  const options: FolderContentOptions = { ...defaultOptions, ...opts }

  const FolderContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props

    const trie = (props.ctx.trie ??= trieFromAllFiles(allFiles))
    const folder = trie.findNode(fileData.slug!.split("/"))
    if (!folder) {
      return null
    }

    const allPagesInFolder: QuartzPluginData[] =
      folder.children
        .map((node) => {
          // regular file, proceed
          if (node.data) {
            return node.data
          }

          if (node.isFolder && options.showSubfolders) {
            // folders that dont have data need synthetic files
            const getMostRecentDates = (): QuartzPluginData["dates"] => {
              let maybeDates: QuartzPluginData["dates"] | undefined = undefined
              for (const child of node.children) {
                if (child.data?.dates) {
                  // compare all dates and assign to maybeDates if its more recent or its not set
                  if (!maybeDates) {
                    maybeDates = { ...child.data.dates }
                  } else {
                    if (child.data.dates.created > maybeDates.created) {
                      maybeDates.created = child.data.dates.created
                    }

                    if (child.data.dates.modified > maybeDates.modified) {
                      maybeDates.modified = child.data.dates.modified
                    }

                    if (child.data.dates.published > maybeDates.published) {
                      maybeDates.published = child.data.dates.published
                    }
                  }
                }
              }
              return (
                maybeDates ?? {
                  created: new Date(),
                  modified: new Date(),
                  published: new Date(),
                }
              )
            }

            return {
              slug: node.slug,
              dates: getMostRecentDates(),
              frontmatter: {
                title: node.displayName,
                tags: [],
              },
            }
          }
        })
        .filter((page) => page !== undefined) ?? []
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    const listProps = {
      ...props,
      sort: options.sort,
      allFiles: allPagesInFolder,
    }

    const blocks = renderBlocks(options.blocks, props)
    const body = withBlocks(tree as Root, blocks)
    const content = (
      body.children.length === 0 ? fileData.description : htmlToJsx(fileData.filePath!, body)
    ) as ComponentChildren

    // Table of contents: the pages and subfolders in this folder, title and
    // one-line description. Skipped on area pages (the area hub lists them);
    // on a folder front with its own list, it carries only what that list omits.
    // blocks that already list this folder's pages: the area hub and the region board
    const listing = new Set(["area-hub", "region-board"])
    // a slot block always renders but only lands where the page leaves its slot
    const slotOnPage = (cls?: string) =>
      (tree as Root).children.some(
        (c) =>
          c.type === "element" &&
          ((c.properties?.className as string[] | undefined) ?? []).includes(cls ?? ""),
      )
    const hasHub = blocks.some(
      (b) => listing.has(b.block.name) && (b.block.placement !== "slot" || slotOnPage(b.block.slot)),
    )
    const norm = (s: string) => s.replace(/\/index$/, "").replace(/\/$/, "")
    const linked = new Set((fileData.links ?? []).map((l) => norm(String(l))))
    const childSlug = (p: QuartzPluginData) => norm(simplifySlug(p.slug as FullSlug))
    const children = allPagesInFolder.filter((p) => p.slug !== fileData.slug)
    // only what the body does not already link; the heading says which case this is
    const unlinked = children.filter((p) => !linked.has(childSlug(p)))
    const partial = unlinked.length < children.length
    const showToc = !hasHub && unlinked.length > 0
    const folderIndex = (p: QuartzPluginData) =>
      allFiles.find((f) => f.slug === `${String(p.slug).replace(/\/index$/, "")}/index`)
    const entry = (p: QuartzPluginData) => {
      const idx = folderIndex(p)
      const title = String(idx?.frontmatter?.title ?? p.frontmatter?.title ?? p.slug)
      const desc = String(idx?.description ?? idx?.frontmatter?.description ?? p.description ?? p.frontmatter?.description ?? "")
      const date = String(p.frontmatter?.date ?? "")
      return { p, title, desc, date, isFolder: !p.filePath }
    }
    const entries = unlinked.map(entry)
    const allMeetings = entries.length > 0 && entries.every((e) => e.p.frontmatter?.type === "meeting")
    entries.sort((a, b) =>
      allMeetings
        ? b.date.localeCompare(a.date)
        : Number(b.isFolder) - Number(a.isFolder) ||
          a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }),
    )

    return (
      <div class="popover-hint">
        <article class={classes}>{content}</article>
        {showToc && (
          <nav class="folder-toc" aria-label={partial ? "Also in this section" : "In this section"}>
            <h2>{partial ? "Also in this section" : "In this section"}</h2>
            <ul>
              {entries.map((e) => (
                <li>
                  <a href={resolveRelative(fileData.slug!, e.p.slug as FullSlug)} class="internal">
                    {e.title}
                  </a>
                  {e.p.frontmatter?.type === "tracker" && e.p.frontmatter?.status && (
                    <span class={`folder-toc-status st-${e.p.frontmatter.status}`}>
                      {String(e.p.frontmatter.status)}
                    </span>
                  )}
                  {e.desc && <span class="folder-toc-desc">{e.desc}</span>}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    )
  }

  FolderContent.css = concatenateResources(style, PageList.css)
  return FolderContent
}) satisfies QuartzComponentConstructor
