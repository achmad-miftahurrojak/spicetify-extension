import { React } from "./react";
import {
  Note,
  NoteTag,
  TAG_ORDER_CREATOR,
  TAG_ORDER_MEMORY,
  TAG_META,
  backupAll,
  downloadJson,
} from "@swp/core";
import { NoteCard } from "./NoteCard";
import { QuickAddBar } from "./QuickAddBar";

interface Props {
  trackUri: string | null;
  positionMs: number;
  notes: Note[];
  defaultTag: NoteTag;
  appMode: "creator" | "memory";
  onSaveSettings: (settings: any) => void;
  onSave: (note: Note) => void;
  onEdit: (note: Note, newText: string) => void;
  onDelete: (note: Note) => void;
  onSeek: (positionMs: number) => void;
  onExportTrack: () => void;
  onRestore: (file: File) => void;
}

export function NotePanel(props: Props) {
  const { trackUri, notes, defaultTag, appMode, onSaveSettings } = props;
  const [filter, setFilter] = React.useState<NoteTag | "all">("all");
  const [tab, setTab] = React.useState<"notes" | "data">("notes");

  const visible = filter === "all" ? notes : notes.filter((n) => n.tag === filter);
  const sorted = [...visible].sort((a, b) => a.positionMs - b.positionMs);

  const onBackup = () => downloadJson(`songwriters-pad-backup-${Date.now()}.json`, backupAll());
  const onRestoreClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => input.files?.[0] && props.onRestore(input.files[0]);
    input.click();
  };

  const tagOrder = appMode === "memory" ? TAG_ORDER_MEMORY : TAG_ORDER_CREATOR;

  return React.createElement(
    "div",
    { className: "swp-panel" },
    React.createElement(
      "div",
      { className: "swp-panel-header" },
      React.createElement(
        "div",
        { className: "swp-segmented-control" },
        React.createElement(
          "button",
          {
            className: appMode === "creator" ? "swp-segment swp-segment-active" : "swp-segment",
            onClick: () => {
              onSaveSettings({ appMode: "creator", defaultTag: "lyric" });
              setFilter("all");
            },
            type: "button",
          },
          "Creator"
        ),
        React.createElement(
          "button",
          {
            className: appMode === "memory" ? "swp-segment swp-segment-active" : "swp-segment",
            onClick: () => {
              onSaveSettings({ appMode: "memory", defaultTag: "person" });
              setFilter("all");
            },
            type: "button",
          },
          "Memory"
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: "16px", marginLeft: "auto" } },
        React.createElement(
          "button",
          { className: tab === "notes" ? "swp-tab swp-tab-active" : "swp-tab", onClick: () => setTab("notes"), type: "button" },
          `Notes (${notes.length})`
        ),
        React.createElement(
          "button",
          { className: tab === "data" ? "swp-tab swp-tab-active" : "swp-tab", onClick: () => setTab("data"), type: "button" },
          "Data"
        )
      )
    ),
    tab === "notes"
      ? React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "div",
            { className: "swp-filter-row" },
            React.createElement(
              "button",
              { className: filter === "all" ? "swp-tag-mini swp-tag-active" : "swp-tag-mini", onClick: () => setFilter("all"), type: "button" },
              "all"
            ),
            tagOrder.map((t) =>
              React.createElement(
                "button",
                {
                  key: t,
                  type: "button",
                  className: filter === t ? "swp-tag-mini swp-tag-active" : "swp-tag-mini",
                  style: { borderColor: `var(${TAG_META[t].colorVar}, transparent)` },
                  onClick: () => setFilter(t),
                },
                TAG_META[t].label
              )
            )
          ),
          React.createElement(
            "div",
            { className: "swp-note-list" },
            sorted.length === 0
              ? React.createElement("p", { className: "swp-empty" }, "No notes on this track yet. Hit the moment, write it down.")
              : sorted.map((n) =>
                  React.createElement(NoteCard, {
                    key: n.id,
                    note: n,
                    onSeek: props.onSeek,
                    onEdit: props.onEdit,
                    onDelete: props.onDelete,
                  })
                )
          ),
          React.createElement(QuickAddBar, {
            trackUri: trackUri ?? "",
            positionMs: props.positionMs,
            defaultTag,
            appMode,
            onSave: props.onSave,
          })
        )
      : React.createElement(
          "div",
          { className: "swp-data" },
          React.createElement("button", { onClick: props.onExportTrack, type: "button" }, "Export this track (.txt / .md)"),
          React.createElement("button", { onClick: onBackup, type: "button" }, "Backup all notes (JSON)"),
          React.createElement("button", { onClick: onRestoreClick, type: "button" }, "Restore from backup"),
          React.createElement("p", { className: "swp-hint" }, "Backup before every Spicetify update. Seriously.")
        )
  );
}
