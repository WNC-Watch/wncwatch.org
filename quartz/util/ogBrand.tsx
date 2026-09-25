import { SocialImageOptions } from "./og"

// The share card every page gets (1200x630, what Facebook and Bluesky show):
// the brand's night package, the same as the social cards in repo/pipeline.
// The mark and wordmark on top, the page's own title in Besley, its
// description in Karla, and a footer line that says what kind of page it is.
// No file dates: a meeting shows the meeting's date, and nothing else is dated.

const INK = "#E8EEF3"
const MUTED = "#9DB2C4"
const AMBER = "#EFB94F"

const MONTHS = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…"
}

function kindLine(fm: Record<string, unknown>): string {
  const type = String(fm.type ?? "")
  if (type === "meeting" && typeof fm.date === "string") {
    const [y, m, d] = String(fm.date).split("-").map(Number)
    return `Meeting record · ${MONTHS[m - 1]} ${d}, ${y}`
  }
  if (fm.date instanceof Date && type === "meeting") {
    const d = fm.date as Date
    return `Meeting record · ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
  }
  if (type === "tracker") return fm.status ? `Tracking · ${String(fm.status)}` : "Tracking"
  const label: Record<string, string> = {
    area: "Area",
    explainer: "Briefing",
    vendor: "The vendors",
    person: "On the record",
    action: "Act",
    reference: "Reference",
  }
  return label[type] ?? ""
}

export const brandImage: SocialImageOptions["imageStructure"] = ({
  cfg,
  title,
  description,
  fileData,
  iconBase64,
}) => {
  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>
  const isHome = fileData.slug === "index"
  const pageTitle = isHome
    ? "The record of how surveillance came to the mountains, kept by neighbors." // the banner tagline
    : String(fm.title ?? title)
  const head = clip(pageTitle, 90)
  const big = head.length <= 48
  const desc = clip(description ?? "", big ? 190 : 140)
  const kind = isHome ? "Sourced to the record" : kindLine(fm)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "56px 64px 48px 64px",
        backgroundImage: "linear-gradient(180deg, #0E1B29 0%, #152C46 55%, #1D3D5F 100%)",
        fontFamily: "Karla",
        color: INK,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {iconBase64 && (
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              flexShrink: 0,
              borderRadius: "50%",
              border: "2px solid rgba(157, 178, 196, 0.45)",
              overflow: "hidden",
            }}
          >
            <img src={iconBase64} width={60} height={60} style={{ width: 60, height: 60 }} />
          </div>
        )}
        <div style={{ display: "flex", fontFamily: "Besley", fontSize: 34, color: INK }}>
          <span>WNC Surveillance Watch</span>
          {/* separate spans are measured apart; pull the period back to the word */}
          <span style={{ color: AMBER, marginLeft: -7 }}>.</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "44px",
          fontFamily: "Besley",
          fontSize: big ? 62 : 50,
          lineHeight: 1.12,
          color: INK,
        }}
      >
        {head}
      </div>

      {desc && (
        <div
          style={{
            display: "flex",
            marginTop: "26px",
            fontSize: 28,
            lineHeight: 1.4,
            color: MUTED,
          }}
        >
          {desc}
        </div>
      )}

      <div
        style={{
          display: "flex",
          marginTop: "auto",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #2A4560",
          paddingTop: "20px",
          fontSize: 26,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex", color: AMBER }}>{kind}</div>
        <div style={{ display: "flex" }}>{cfg.baseUrl}</div>
      </div>
    </div>
  )
}
