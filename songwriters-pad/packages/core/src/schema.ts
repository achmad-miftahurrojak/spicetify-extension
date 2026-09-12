export const SCHEMA_VERSION = 1;

export type NoteTag = "lyric" | "melody" | "chord" | "vibe" | "person" | "moment" | "feeling" | "place";

export const TAG_ORDER_CREATOR: NoteTag[] = ["lyric", "melody", "chord", "vibe"];
export const TAG_ORDER_MEMORY: NoteTag[] = ["person", "moment", "feeling", "place"];

export const TAG_META: Record<NoteTag, { label: string; colorVar: string }> = {
  lyric: { label: "Lyric", colorVar: "--spice-lyric" },
  melody: { label: "Melody", colorVar: "--spice-melody" },
  chord: { label: "Chord", colorVar: "--spice-chord" },
  vibe: { label: "Vibe", colorVar: "--spice-vibe" },
  person: { label: "Person", colorVar: "--spice-button" },
  moment: { label: "Moment", colorVar: "--spice-button-active" },
  feeling: { label: "Feeling", colorVar: "--spice-text" },
  place: { label: "Place", colorVar: "--spice-subtext" },
};

export interface Note {
  id: string;
  trackUri: string;
  positionMs: number;
  text: string;
  tag: NoteTag;
  personName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SwpSettings {
  appMode: "creator" | "memory";
  shortcut: string;
  defaultTag: NoteTag;
  onboarded: boolean;
}

export interface BackupFile {
  app: "songwriters-pad";
  schemaVersion: number;
  exportedAt: number;
  notes: Record<string, Note[]>;
  settings: SwpSettings;
}

export function createNote(
  trackUri: string,
  positionMs: number,
  text: string,
  tag: NoteTag,
  personName?: string
): Note {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    trackUri,
    positionMs,
    text,
    tag,
    ...(personName ? { personName } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

export function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function parseTimestamp(mmss: string): number {
  const [m, s] = mmss.split(":").map(Number);
  return (m * 60 + (s || 0)) * 1000;
}

export function defaultSettings(): SwpSettings {
  return { appMode: "creator", shortcut: "ctrl+shift+.", defaultTag: "lyric", onboarded: false };
}

/** Placeholder for future schema migrations. Reads swp:schemaVersion. */
export function needsMigration(rawVersion: string | null): boolean {
  return rawVersion !== String(SCHEMA_VERSION);
}
