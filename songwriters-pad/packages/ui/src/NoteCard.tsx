import { React } from "./react";
import { Note, TAG_META, TAG_ORDER_MEMORY, formatTimestamp } from "@swp/core";
import { MemoryCard } from "./MemoryCard";
import { toPng } from "html-to-image";

const EDIT_ICON = () => React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" }));
const TRASH_ICON = () => React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement("path", { d: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" }));
const CHECK_ICON = () => React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement("path", { d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" }));
const X_ICON = () => React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" }));
const DOWNLOAD_ICON = () => React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement("path", { d: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" }));

interface Props {
  note: Note;
  onSeek: (positionMs: number) => void;
  onEdit: (note: Note, newText: string) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onSeek, onEdit, onDelete }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(note.text);
  const [confirming, setConfirming] = React.useState(false);

  const startEdit = () => { setDraft(note.text); setEditing(true); setConfirming(false); };
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== note.text) onEdit(note, trimmed);
    setEditing(false);
  };

  const containerId = `swp-memory-card-${note.id}`;
  const [exporting, setExporting] = React.useState(false);

  const exportImage = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const node = document.getElementById(containerId);
      if (!node) throw new Error("Card node not found");
      const dataUrl = await toPng(node, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `Memory_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
    } finally {
      setExporting(false);
    }
  };

  const meta = TAG_META[note.tag];
  return React.createElement(
    "div",
    { className: "swp-note-card" },
    React.createElement(
      "div",
      { className: "swp-note-head" },
      React.createElement("button", { className: "swp-ts", title: "Jump to this moment", onClick: () => onSeek(note.positionMs), type: "button" }, formatTimestamp(note.positionMs)),
      React.createElement("span", { className: "swp-tag-label", style: { color: `var(${meta.colorVar}, var(--spice-subtext))` } }, meta.label),
      note.personName && React.createElement("span", { className: "swp-person-badge", style: { fontSize: "11px", backgroundColor: "var(--spice-button)", color: "var(--spice-main)", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px", fontWeight: "bold" } }, `@${note.personName}`),
      React.createElement(
        "span",
        { className: "swp-note-actions" },
        !editing && TAG_ORDER_MEMORY.includes(note.tag)
          ? React.createElement("button", { onClick: exportImage, title: "Export Card", type: "button", style: { opacity: exporting ? 0.5 : 1 } }, DOWNLOAD_ICON())
          : null,
        editing
          ? null
          : React.createElement("button", { onClick: startEdit, title: "Edit", type: "button" }, EDIT_ICON()),
        !editing && !confirming
          ? React.createElement("button", { className: "swp-btn-delete", onClick: () => setConfirming(true), title: "Delete", type: "button" }, TRASH_ICON())
          : null
      )
    ),
    editing
      ? React.createElement(
          "div",
          { className: "swp-input-wrapper" },
          React.createElement("textarea", {
            className: "swp-input",
            value: draft,
            rows: 2,
            autoFocus: true,
            onChange: (e: any) => setDraft(e.target.value),
            onKeyDown: (e: any) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === "Escape") setEditing(false); },
          }),
          React.createElement(
            "div",
            { className: "swp-edit-actions" },
            React.createElement("button", { onClick: () => setEditing(false), type: "button", title: "Cancel" }, X_ICON()),
            React.createElement("button", { onClick: save, type: "button", title: "Save" }, CHECK_ICON())
          )
        )
      : React.createElement("p", { className: "swp-note-text" }, note.text),
    confirming
      ? React.createElement(
          "div",
          { className: "swp-confirm" },
          React.createElement("span", null, "Delete note?"),
          React.createElement("button", { className: "swp-btn-no", onClick: () => setConfirming(false), type: "button" }, "Keep"),
          React.createElement("button", { className: "swp-btn-yes", onClick: () => { onDelete(note); setConfirming(false); }, type: "button" }, "Delete")
        )
      : null,
    TAG_ORDER_MEMORY.includes(note.tag) && React.createElement(MemoryCard, { note, containerId })
  );
}
