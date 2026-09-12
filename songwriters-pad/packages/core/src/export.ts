import { Note, formatTimestamp } from "./schema";

export type ExportFormat = "txt" | "md";

export function exportTrackNotes(
  artist: string,
  title: string,
  notes: Note[],
  format: ExportFormat
): string {
  const sorted = [...notes].sort((a, b) => a.positionMs - b.positionMs);
  const lines = sorted.map(
    (n) => `[${formatTimestamp(n.positionMs)}] [${n.tag.toUpperCase()}] ${n.text}`
  );
  if (format === "md") {
    return [`# ${artist} - ${title}`, "", ...lines, ""].join("\n");
  }
  return [`${artist} - ${title}`, "", ...lines, ""].join("\n");
}

export function downloadFile(filename: string, content: string, mime = "text/plain"): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadJson(filename: string, data: unknown): void {
  downloadFile(filename, JSON.stringify(data, null, 2), "application/json");
}
