import { QuartzComponent, QuartzComponentConstructor } from "./types"

// Filters for the regional timeline (quartz/plugins/transformers/events.ts,
// data-events="region"): one area select and a row of kind buttons. Renders
// nothing itself; the script wires any [data-tl-filters] on the page. Without
// script, every event shows.

const RegionTimeline: QuartzComponent = () => null

RegionTimeline.afterDOMLoaded = `
document.addEventListener("nav", () => {
  const bar = document.querySelector("[data-tl-filters]")
  if (!bar) return
  const root = bar.closest(".tl-region")
  const select = bar.querySelector("[data-tl-area]")
  const buttons = [...bar.querySelectorAll("[data-tl-kind]")]
  let kind = ""
  const apply = () => {
    const area = select.value
    for (const item of root.querySelectorAll(".tl-item[data-kind]")) {
      const areas = (item.getAttribute("data-area") || "").split("|")
      const show = (!area || areas.includes(area)) && (!kind || item.getAttribute("data-kind") === kind)
      item.hidden = !show
    }
    // a year heading hides when nothing under it shows
    for (const head of root.querySelectorAll("[data-tl-group]")) {
      const list = head.nextElementSibling
      const any = list && [...list.querySelectorAll(".tl-item")].some((i) => !i.hidden)
      head.hidden = !any
      if (list) list.hidden = !any
    }
  }
  const onKind = (e) => {
    kind = e.currentTarget.getAttribute("data-tl-kind")
    for (const b of buttons) b.setAttribute("aria-pressed", String(b === e.currentTarget))
    apply()
  }
  select.addEventListener("change", apply)
  window.addCleanup(() => select.removeEventListener("change", apply))
  for (const b of buttons) {
    b.addEventListener("click", onKind)
    window.addCleanup(() => b.removeEventListener("click", onKind))
  }
})
`

RegionTimeline.css = `
.tl-region .tl-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.25rem;
  margin: 1rem 0 1.25rem;
}
.tl-region .tl-filter-area {
  font-weight: 600;
  font-size: 0.95rem;
}
.tl-region .tl-filter-area select {
  margin-left: 0.4rem;
  font: inherit;
  font-weight: 400;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  background: var(--light);
  color: var(--dark);
}
.tl-region .tl-filter-kinds {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tl-region .tl-filter-kinds button {
  font: inherit;
  font-size: 0.9rem;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  background: transparent;
  color: var(--darkgray);
  cursor: pointer;
}
.tl-region .tl-filter-kinds button[aria-pressed="true"] {
  background: var(--secondary);
  border-color: var(--secondary);
  color: var(--light);
}
.tl-region .tl-area {
  margin-right: 0.5rem;
  color: var(--darkgray);
  font-weight: 600;
}
.tl-region .tl-era {
  margin-top: 1.5rem;
}
`

export default (() => RegionTimeline) satisfies QuartzComponentConstructor
