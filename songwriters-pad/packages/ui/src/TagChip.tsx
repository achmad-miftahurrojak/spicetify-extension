import { React } from "./react";
import { TAG_META, NoteTag } from "@swp/core";

export function TagChip({ tag, onClick, active }: {
  tag: NoteTag;
  onClick?: (tag: NoteTag) => void;
  active?: boolean;
}) {
  const meta = TAG_META[tag];
  return React.createElement(
    "button",
    {
      className: `swp-tag${active ? " swp-tag-active" : ""}`,
      style: { borderColor: `var(${meta.colorVar}, var(--spice-subtext))` },
      onClick: onClick ? () => onClick(tag) : undefined,
      type: "button",
    },
    meta.label
  );
}
