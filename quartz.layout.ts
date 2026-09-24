import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { FileTrieNode } from "./quartz/util/fileTrie"
import { AreaHub } from "./quartz/components/blocks/areaHub"
import { OfficeBlock } from "./quartz/components/blocks/officeBlock"
import { AreaLead } from "./quartz/components/blocks/areaLead"
import { RegionBoard } from "./quartz/components/blocks/regionBoard"
import { VerifiedFooter } from "./quartz/components/blocks/verifiedFooter"

// Body blocks: components drawn inside the article from data, in the position
// each block declares (see components/pages/Content.tsx). One entry per block;
// the block itself decides which pages it renders on.
export const bodyBlocks = [AreaLead, AreaHub, OfficeBlock, RegionBoard, VerifiedFooter]
export const pageBody = Component.Content({ blocks: bodyBlocks })
// Folder index pages (every area page is one) render through FolderContent.
export const folderBody = Component.FolderContent({ blocks: bodyBlocks })

// Explorer order: the way the site reads, not the alphabet. Defined once and
// shared by both layouts. The Explorer serializes this function's source and
// runs it in the browser, so everything it uses lives inside its own body.
// Depth 1 (sections): the ranked list, then any other folder alphabetically,
// then loose pages. Depth 3 (inside an area under WNC/): Officials, Record,
// Community first, then other folders, then loose pages. Everywhere else:
// folders before files, both alphabetical.
const explorerSortFn = (a: FileTrieNode, b: FileTrieNode): number => {
  if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
  if (a.isFolder && b.isFolder) {
    const sectionOrder = ["WNC", "Meetings", "Briefings", "Companies", "Act", "Reference"]
    const areaOrder = ["Officials", "Record", "Community"]
    const depth = a.slug.split("/").length
    const order = depth === 2 ? sectionOrder : depth === 4 && a.slug.startsWith("WNC/") ? areaOrder : []
    const ia = order.indexOf(a.slugSegment)
    const ib = order.indexOf(b.slugSegment)
    const ra = ia === -1 ? order.length : ia
    const rb = ib === -1 ? order.length : ib
    if (ra !== rb) return ra - rb
    // Among the areas, the state and federal roster sorts after the counties.
    if (depth === 3 && a.slug.startsWith("WNC/")) {
      const la = a.slugSegment === "Raleigh-and-Washington" ? 1 : 0
      const lb = b.slugSegment === "Raleigh-and-Washington" ? 1 : 0
      if (la !== lb) return la - lb
    }
  }
  return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: "base" })
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      Facebook: "https://www.facebook.com/wncwatch",
      Instagram: "https://www.instagram.com/wncwatch",
      Bluesky: "https://bsky.app/profile/wncwatch.bsky.social",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ sortFn: explorerSortFn }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({ sortFn: explorerSortFn }),
  ],
  right: [],
}
