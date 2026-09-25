import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { folderBody, pageBody } from "./quartz.layout"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "WNC Surveillance Watch",
    pageTitleSuffix: " - WNC Surveillance Watch",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "wncwatch.org",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        // the brand's type: Besley (the wordmark's slab serif) for headings,
        // Karla for text, IBM Plex Mono for data (repo/pipeline card renderer)
        header: "Besley",
        body: "Karla",
        code: "IBM Plex Mono",
      },
      colors: {
        // light: the brand's print package (ink on paper, the darker amber)
        lightMode: {
          light: "#EDE9E0",
          lightgray: "#DDD6C8",
          gray: "#8C96A0",
          darkgray: "#33414E",
          dark: "#22303C",
          secondary: "#1D4F7A",
          tertiary: "#8A5B00",
          highlight: "rgba(29, 79, 122, 0.08)",
          textHighlight: "#EFB94F55",
        },
        // dark: the brand's night package (ground, panel, ink, amber)
        darkMode: {
          light: "#16293C",
          lightgray: "#2A4560",
          gray: "#6F869B",
          darkgray: "#C9D5DF",
          dark: "#E8EEF3",
          secondary: "#8FC1EC",
          tertiary: "#EFB94F",
          highlight: "rgba(157, 178, 196, 0.10)",
          textHighlight: "#EFB94F44",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.Calendar(),
      Plugin.Events(),
      Plugin.Tables(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage({ pageBody }),
      Plugin.FolderPage({ pageBody: folderBody }),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
