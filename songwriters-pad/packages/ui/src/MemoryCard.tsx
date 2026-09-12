import { React } from "./react";
import { Note, formatTimestamp, getTrackInfo } from "@swp/core";

interface Props {
  note: Note;
  containerId: string;
}

export function MemoryCard({ note, containerId }: Props) {
  const info = getTrackInfo();
  const title = info?.name || "Unknown Track";
  const artist = info?.artist || "Unknown Artist";
  const coverUrl = info?.imageUrl;

  return React.createElement(
    "div",
    {
      id: containerId,
      style: {
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "1080px",
        height: "1350px",
        backgroundColor: "var(--spice-main, #121212)",
        color: "var(--spice-text, #ffffff)",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        boxSizing: "border-box",
        fontFamily: "var(--font-family, sans-serif)",
      }
    },
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "450px",
          borderRadius: "24px",
          background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--spice-button-active, #1db954), var(--spice-button, #1ed760))",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          marginBottom: "60px",
        }
      }
    ),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px" } },
      React.createElement("h1", { style: { margin: 0, fontSize: "64px", fontWeight: "bold", lineHeight: 1.1, letterSpacing: "-1px" } }, title),
      React.createElement("h2", { style: { margin: 0, fontSize: "36px", fontWeight: "normal", color: "var(--spice-subtext, #b3b3b3)" } }, artist)
    ),
    React.createElement(
      "div",
      { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" } },
      React.createElement("span", { style: { fontSize: "32px", color: "var(--spice-button-active, #1db954)", fontWeight: "bold", marginBottom: "24px" } }, formatTimestamp(note.positionMs)),
      React.createElement("p", { style: { margin: 0, fontSize: "48px", fontWeight: 500, lineHeight: 1.3, whiteSpace: "pre-wrap" } }, `"${note.text}"`),
      note.personName && React.createElement("span", { style: { marginTop: "32px", fontSize: "36px", color: "var(--spice-subtext, #b3b3b3)", fontStyle: "italic" } }, `@${note.personName}`)
    ),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "2px solid rgba(255,255,255,0.1)", paddingTop: "40px", marginTop: "40px" } },
      React.createElement("span", { style: { fontSize: "24px", color: "var(--spice-subtext, #b3b3b3)" } }, new Date(note.createdAt).toLocaleDateString()),
      React.createElement("span", { style: { fontSize: "24px", fontWeight: "bold", opacity: 0.5 } }, "via Songwriter's Pad")
    )
  );
}
