import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import { QuartzTransformerPlugin } from "../types"

// Browse Everything, built at build time. A page that carries the line
//   <div data-browse-all></div>
// gets it replaced with the whole tree as markdown (so its headings feed the
// page's table of contents): one group per section in the site bar's order,
// sub-groups per folder, one line per page, the page's own title linked and
// its own frontmatter description. No prose is written here. Replaces the
// hand-run browse_everything.py (retired 2026-09-24).

const SKIP = new Set(["assets", "private", "templates", ".obsidian"])
const SECTION_ORDER = ["WNC", "Companies", "Briefings", "Act", "Reference"]
const AREA_ORDER = ["Officials", "Tracking", "Meetings", "Community"]
const MARKER = /^<div data-browse-all><\/div>$/m

type Meta = { title: string; description: string }

function readMeta(file: string, cache: Map<string, Meta>): Meta {
  const hit = cache.get(file)
  if (hit) return hit
  const text = fs.readFileSync(file, "utf8")
  let fm: Record<string, unknown> = {}
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---\n", 4)
    try {
      fm = (yaml.load(text.slice(4, end)) as Record<string, unknown>) ?? {}
    } catch {
      fm = {}
    }
  }
  const meta = {
    title: String(fm.title ?? path.basename(file, ".md")),
    description: String(fm.description ?? "").trim(),
  }
  cache.set(file, meta)
  return meta
}

export function buildBrowseAll(content: string): string {
  const cache = new Map<string, Meta>()
  const out: string[] = []
  const wikilink = (rel: string) => {
    const slug = rel.replace(/\.md$/, "")
    const base = path.basename(slug)
    const { title } = readMeta(path.join(content, rel), cache)
    if (base === "index") return `[[${slug}|${title}]]`
    return base === title ? `[[${base}]]` : `[[${base}|${title}]]`
  }
  const line = (rel: string) => {
    const { description } = readMeta(path.join(content, rel), cache)
    return `- **${wikilink(rel)}**` + (description ? `: ${description}` : "")
  }
  const list = (relDir: string) => {
    const full = path.join(content, relDir)
    const entries = fs.readdirSync(full).sort()
    const folders = entries.filter((e) => fs.statSync(path.join(full, e)).isDirectory() && !SKIP.has(e))
    const files = entries.filter((e) => e.endsWith(".md") && e !== "index.md")
    return { folders, files }
  }
  const orderFolders = (parent: string, folders: string[]) => {
    const depth = parent ? parent.split("/").length : 0
    const order = depth === 0 ? SECTION_ORDER : parent.startsWith("WNC/") && depth === 2 ? AREA_ORDER : []
    if (parent === "WNC") {
      // the state and federal roster after the counties
      return [...folders].sort(
        (a, b) =>
          Number(a === "Raleigh and Washington") - Number(b === "Raleigh and Washington") ||
          a.localeCompare(b),
      )
    }
    const rank = (f: string) => (order.includes(f) ? order.indexOf(f) : order.length)
    return [...folders].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
  }
  const group = (relDir: string, level: number) => {
    const { folders, files } = list(relDir)
    const idx = path.join(relDir, "index.md")
    const hasIdx = fs.existsSync(path.join(content, idx))
    const title = hasIdx ? readMeta(path.join(content, idx), cache).title : path.basename(relDir)
    out.push("#".repeat(level) + " " + (hasIdx ? `[[${relDir}/index|${title}]]` : title), "")
    const isMeetings = path.basename(relDir) === "Meetings"
    const byTitle = (a: string, b: string) =>
      readMeta(path.join(content, relDir, a), cache).title.localeCompare(
        readMeta(path.join(content, relDir, b), cache).title,
        undefined,
        { numeric: true, sensitivity: "base" },
      )
    // meeting records (titles start with their date) newest first
    const sorted = [...files].sort((a, b) => (isMeetings ? byTitle(b, a) : byTitle(a, b)))
    for (const f of sorted) out.push(line(path.join(relDir, f)))
    if (files.length) out.push("")
    for (const sub of orderFolders(relDir, folders)) group(path.join(relDir, sub), Math.min(level + 1, 4))
  }
  const top = list("")
  for (const sec of orderFolders("", top.folders)) group(sec, 2)
  const loose = top.files.filter((f) => f !== "Browse Everything.md")
  if (loose.length) {
    out.push("## Other pages", "")
    for (const f of loose.sort((a, b) =>
      readMeta(path.join(content, a), cache).title.localeCompare(readMeta(path.join(content, b), cache).title),
    ))
      out.push(line(f))
    out.push("")
  }
  return out.join("\n").trimEnd()
}

export const BrowseAll: QuartzTransformerPlugin = () => ({
  name: "BrowseAll",
  textTransform(ctx, src) {
    if (!MARKER.test(src)) return src
    return src.replace(MARKER, () => buildBrowseAll(ctx.argv.directory))
  },
})
