import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
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
    Component.Explorer({
      sortFn: (a, b) => {
        // Section order for the sidebar: the way the site reads, not the alphabet.
        const order = ["The-Record", "The-System", "WNC", "Companies", "The-Wider-Fight", "People", "Act", "Reference"]
        const ra = order.indexOf(a.slugSegment)
        const rb = order.indexOf(b.slugSegment)
        if (a.isFolder && b.isFolder && (ra !== -1 || rb !== -1)) {
          return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb)
        }
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: "base" })
      },
    }),
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
    Component.Explorer({
      sortFn: (a, b) => {
        // Section order for the sidebar: the way the site reads, not the alphabet.
        const order = ["The-Record", "The-System", "WNC", "Companies", "The-Wider-Fight", "People", "Act", "Reference"]
        const ra = order.indexOf(a.slugSegment)
        const rb = order.indexOf(b.slugSegment)
        if (a.isFolder && b.isFolder && (ra !== -1 || rb !== -1)) {
          return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb)
        }
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: "base" })
      },
    }),
  ],
  right: [],
}
