import {
  BackupFile,
  Note,
  SCHEMA_VERSION,
  SwpSettings,
  defaultSettings,
  needsMigration,
} from "./schema";

declare const Spicetify: any;

const PREFIX = "swp:";

type KV = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
};

function ls(): KV {
  const sp = typeof Spicetify !== "undefined" ? Spicetify.LocalStorage : null;
  if (sp && typeof sp.getItem === "function") return sp;
  return window.localStorage;
}

export function loadNotes(trackUri: string): Note[] {
  const raw = ls().getItem(`${PREFIX}notes:${trackUri}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

export function saveNotes(trackUri: string, notes: Note[]): boolean {
  try {
    ls().setItem(`${PREFIX}notes:${trackUri}`, JSON.stringify(notes));
    ls().setItem(`${PREFIX}schemaVersion`, String(SCHEMA_VERSION));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings(): SwpSettings {
  const raw = ls().getItem(`${PREFIX}settings`);
  if (!raw) return defaultSettings();
  try {
    return { ...defaultSettings(), ...(JSON.parse(raw) as SwpSettings) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: SwpSettings): void {
  ls().setItem(`${PREFIX}settings`, JSON.stringify(settings));
}

export function backupAll(): BackupFile {
  const notes: Record<string, Note[]> = {};
  const registry = getRegistry();
  for (const uri of registry) {
    const n = loadNotes(uri);
    if (n.length > 0) notes[uri] = n;
  }
  return {
    app: "songwriters-pad",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    notes,
    settings: loadSettings(),
  };
}

export function restoreAll(backup: BackupFile): number {
  if (backup.app !== "songwriters-pad") {
    throw new Error("Not a Songwriter's Pad backup file.");
  }
  if (needsMigration(String(backup.schemaVersion))) {
    throw new Error(
      `Unsupported schema version ${backup.schemaVersion}. Expected ${SCHEMA_VERSION}.`
    );
  }
  let count = 0;
  const registry = getRegistry();
  for (const [uri, notes] of Object.entries(backup.notes)) {
    saveNotes(uri, notes);
    count += notes.length;
    if (!registry.includes(uri)) registry.push(uri);
  }
  saveRegistry(registry);
  saveSettings({ ...defaultSettings(), ...backup.settings });
  return count;
}

export function getRegistry(): string[] {
  const raw = ls().getItem(`${PREFIX}registry`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function registerTrack(trackUri: string): void {
  const registry = getRegistry();
  if (!registry.includes(trackUri)) {
    registry.push(trackUri);
    saveRegistry(registry);
  }
}

function saveRegistry(registry: string[]): void {
  ls().setItem(`${PREFIX}registry`, JSON.stringify(registry));
}
