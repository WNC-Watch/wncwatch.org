import { Element, ElementContent, Root } from "hast"
import { visit } from "unist-util-visit"
import { QuartzTransformerPlugin } from "../types"

// Tables: readable rows for text-heavy tables (2026-09-24).
//
// Every <td> gets data-label set to its column's header text, so a phone can
// show each row as a card with the label beside each value (custom.scss,
// "Content tables"). A table whose longest cell runs to PROSE_WORDS words or
// more gets the class "tbl-prose": wider minimum columns on a desktop, and
// the stacked card layout on a phone. Short, numeric tables (payment
// schedules, vote tallies) keep the ordinary table layout everywhere.

const PROSE_WORDS = 12

function textOf(node: ElementContent | Element): string {
  if (node.type === "text") return node.value
  if (node.type === "element") return node.children.map(textOf).join("")
  return ""
}

function rowsOf(table: Element): Element[] {
  const rows: Element[] = []
  visit(table, "element", (node: Element) => {
    if (node.tagName === "tr") rows.push(node)
  })
  return rows
}

function cellsOf(row: Element): Element[] {
  return row.children.filter(
    (c): c is Element => c.type === "element" && (c.tagName === "td" || c.tagName === "th"),
  )
}

export function labelTable(table: Element, proseWords = PROSE_WORDS): void {
  const rows = rowsOf(table)
  if (rows.length === 0) return
  const headRow = rows.find((r) => cellsOf(r).every((c) => c.tagName === "th"))
  const labels = headRow ? cellsOf(headRow).map((c) => textOf(c).trim()) : []
  let longest = 0
  for (const row of rows) {
    if (row === headRow) continue
    cellsOf(row).forEach((cell, i) => {
      if (cell.tagName !== "td") return
      const label = labels[i]
      if (label) cell.properties = { ...(cell.properties ?? {}), dataLabel: label }
      const words = textOf(cell).trim().split(/\s+/).filter(Boolean).length
      if (words > longest) longest = words
    })
  }
  if (longest >= proseWords) {
    const existing = table.properties?.className
    const classes = Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : []
    if (!classes.includes("tbl-prose")) classes.push("tbl-prose")
    table.properties = { ...(table.properties ?? {}), className: classes }
  }
}

export const Tables: QuartzTransformerPlugin = () => {
  return {
    name: "Tables",
    htmlPlugins() {
      return [
        () => (tree: Root) => {
          visit(tree, "element", (node: Element) => {
            if (node.tagName === "table") labelTable(node)
          })
        },
      ]
    },
  }
}
