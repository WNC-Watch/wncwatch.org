import { pathToRoot, resolveRelative, FullSlug } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// The site bar: the mark (the LED tier from repo/pipeline/mark_master.py, the one built for small sizes) and the wordmark (Besley, with the amber period, as on the banners)
// and the site's sections, full width above the page, in the brand's night
// colors in both light and dark mode.

const SECTIONS: { label: string; slug: string }[] = [
  { label: "Region", slug: "WNC/index" },
  { label: "Meetings", slug: "Meetings/index" },
  { label: "Briefings", slug: "Briefings/index" },
  { label: "Vendors", slug: "Companies/index" },
  { label: "Act", slug: "Act/index" },
  { label: "Reference", slug: "Reference/index" },
]

const SiteBar: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
  const slug = fileData.slug! as FullSlug
  const here = (s: string) => slug.startsWith(s.replace(/index$/, ""))
  return (
    <div class="site-bar">
      <div class="site-bar-inner">
        <a class="wordmark" href={pathToRoot(slug)}>
          <img
            class="site-mark"
            src={`${pathToRoot(slug)}/static/mark.svg`}
            alt=""
            width={40}
            height={40}
          />
          <span>
            {cfg.pageTitle}
            <span class="wordmark-dot">.</span>
          </span>
        </a>
        <nav class="site-nav" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a
              href={resolveRelative(slug, s.slug as FullSlug)}
              class={here(s.slug) ? "active" : ""}
              aria-current={here(s.slug) ? "page" : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

SiteBar.css = `
.site-bar {
  background: linear-gradient(180deg, #0E1B29 0%, #152C46 100%);
  border-bottom: 3px solid #1D3D5F;
}
.site-bar-inner {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0.9rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 2rem;
  flex-wrap: wrap;
}
.site-bar .wordmark {
  font-family: "Besley", Georgia, serif;
  font-weight: 800;
  font-size: 1.55rem;
  line-height: 1.15;
  color: #E8EEF3;
  text-decoration: none;
  background: none;
  padding: 0;
}
.site-bar .wordmark {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}
.site-bar .site-mark {
  width: 40px;
  height: 40px;
  margin: 0;
  flex: none;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(157, 178, 196, 0.25);
}
.site-bar .wordmark-dot {
  color: #EFB94F;
}
.site-bar .site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
}
.site-bar .site-nav a {
  font-family: var(--bodyFont);
  font-weight: 600;
  font-size: 1rem;
  color: #C9D5DF;
  background: none;
  padding: 0.15rem 0;
  text-decoration: none;
  border-bottom: 2px solid transparent;
}
.site-bar .site-nav a:hover {
  color: #EFB94F;
}
.site-bar .site-nav a.active {
  color: #E8EEF3;
  border-bottom-color: #EFB94F;
}
@media all and (max-width: 800px) {
  .site-bar-inner {
    padding: 0.75rem 1rem;
  }
  .site-bar .wordmark {
    font-size: 1.3rem;
  }
  .site-bar .site-mark {
    width: 34px;
    height: 34px;
  }
  .site-bar .site-nav {
    gap: 0.25rem 1rem;
  }
}
`

export default (() => SiteBar) satisfies QuartzComponentConstructor
