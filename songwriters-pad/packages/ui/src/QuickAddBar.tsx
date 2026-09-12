import { React } from "./react";
import { NoteTag, TAG_ORDER_CREATOR, TAG_ORDER_MEMORY, TAG_META, createNote, formatTimestamp } from "@swp/core";

const SEND_ICON = () => React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "currentColor" }, React.createElement("path", { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" }));

interface Props {
  trackUri: string;
  positionMs: number;
  defaultTag: NoteTag;
  appMode?: "creator" | "memory";
  onSave: (note: ReturnType<typeof createNote>) => void;
}

export function QuickAddBar({ trackUri, positionMs, defaultTag, appMode = "creator", onSave }: Props) {
  const [text, setText] = React.useState("");
  const [tag, setTag] = React.useState<NoteTag>(defaultTag);
  const [personName, setPersonName] = React.useState("");

  React.useEffect(() => {
    const validTags = appMode === "memory" ? TAG_ORDER_MEMORY : TAG_ORDER_CREATOR;
    if (!validTags.includes(tag)) setTag(validTags[0]);
  }, [appMode, tag]);

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed || !trackUri) return;
    onSave(createNote(trackUri, positionMs, trimmed, tag, tag === "person" ? personName.trim() : undefined));
    setText("");
    setPersonName("");
  };

  const tagOrder = appMode === "memory" ? TAG_ORDER_MEMORY : TAG_ORDER_CREATOR;

  return React.createElement(
    "div",
    { className: "swp-quick-add" },
    React.createElement(
      "div",
      { className: "swp-quick-add-top" },
      React.createElement("span", { className: "swp-ts-static" }, formatTimestamp(positionMs)),
      React.createElement(
        "div",
        { className: "swp-tag-row" },
        tagOrder.map((t) =>
          React.createElement(
            "button",
            {
              key: t,
              type: "button",
              className: `swp-tag-mini${t === tag ? " swp-tag-active" : ""}`,
              onClick: () => setTag(t),
            },
            TAG_META[t].label
          )
        )
      )
    ),
    tag === "person" && React.createElement("input", {
      className: "swp-input",
      style: { marginBottom: "8px", padding: "4px 8px" },
      placeholder: "Who?",
      value: personName,
      onChange: (e: any) => setPersonName(e.target.value),
    }),
    React.createElement(
      "div",
      { className: "swp-input-wrapper" },
      React.createElement("textarea", {
        className: "swp-input",
        placeholder: "Capture the idea...",
        value: text,
        rows: 1,
        onChange: (e: any) => setText(e.target.value),
        onKeyDown: (e: any) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            save();
          }
        },
      }),
      React.createElement(
        "button",
        { className: "swp-save-btn", onClick: save, type: "button", disabled: !text.trim(), title: "Save (Enter)" },
        SEND_ICON()
      )
    )
  );
}
