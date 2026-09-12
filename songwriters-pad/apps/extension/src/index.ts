import {
  Note,
  getCurrentTrackUri,
  getProgressMs,
  getTrackInfo,
  loadNotes,
  loadSettings,
  saveNotes,
  saveSettings,
  restoreAll,
  registerTrack,
  onTrackChange,
  seekTo,
  exportTrackNotes,
  downloadFile,
  isAd,
} from "@swp/core";
import { React, ReactDOM } from "@swp/ui/src/react";
import { NotePanel } from "@swp/ui";

const CSS = `
#swp-section { margin: 0 0 16px 0; padding: 16px; border-radius: 8px;
  background: var(--spice-card, rgba(255,255,255,0.05)); color: var(--spice-text, #fff);
  border: none; font-family: var(--font-family, sans-serif); }
#swp-section .swp-panel { display: flex; flex-direction: column; gap: 16px; }
#swp-section .swp-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
#swp-section .swp-segmented-control { display: flex; background: rgba(255,255,255,0.1); border-radius: 32px; padding: 4px; gap: 4px; }
#swp-section .swp-segment { background: transparent; border: none; color: rgba(255,255,255,0.6);
  padding: 6px 16px; border-radius: 24px; cursor: pointer;
  font-size: 13px; font-weight: 700; transition: all 0.2s ease; }
#swp-section .swp-segment:hover { color: #fff; }
#swp-section .swp-segment-active { background: rgba(255,255,255,0.15); color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
#swp-section .swp-tab { background: none; border: none; color: rgba(255,255,255,0.6);
  padding: 0 0 4px 0; cursor: pointer; border-bottom: 2px solid transparent; 
  font-size: 14px; font-weight: 700; transition: color 0.2s ease; }
#swp-section .swp-tab:hover { color: #fff; }
#swp-section .swp-tab-active { color: #fff; border-bottom-color: var(--spice-button, #1db954); }
#swp-section .swp-filter-row { display: flex; flex-wrap: wrap; gap: 8px; }
#swp-section .swp-tag-mini { background: rgba(255,255,255,0.1); border: none;
  color: #fff; border-radius: 32px; padding: 6px 14px; font-size: 13px; font-weight: 400;
  cursor: pointer; text-transform: capitalize; transition: all 0.2s ease; }
#swp-section .swp-tag-mini:hover { background: rgba(255,255,255,0.15); }
#swp-section .swp-tag-active { background: var(--spice-button, #1db954); color: #000; font-weight: 600; }
#swp-section .swp-note-list { max-height: 40vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; margin: 0 -8px; padding: 0 8px; }
#swp-section .swp-empty { color: rgba(255,255,255,0.6); font-size: 14px; padding: 32px 0; text-align: center; line-height: 1.5; }
#swp-section .swp-note-card { border: none;
  border-radius: 8px; padding: 12px; background: rgba(0,0,0,0.2); }
#swp-section .swp-note-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
#swp-section .swp-ts { background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 4px;
  font-family: monospace; cursor: pointer; padding: 2px 6px; font-size: 12px; transition: background 0.2s ease; }
#swp-section .swp-ts:hover { background: rgba(255,255,255,0.2); }
#swp-section .swp-ts-static { color: rgba(255,255,255,0.6); font-family: monospace; font-size: 12px; }
#swp-section .swp-tag-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; flex: 1; color: rgba(255,255,255,0.6); }
#swp-section .swp-note-actions button { background: none; border: none;
  color: rgba(255,255,255,0.4); cursor: pointer; margin-left: 8px; padding: 4px; transition: color 0.2s ease; }
#swp-section .swp-note-actions button:hover { color: #fff; }
#swp-section .swp-note-text { margin: 0; font-size: 14px; line-height: 1.5; color: #fff; white-space: pre-wrap; font-weight: 400; }
#swp-section .swp-quick-add { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-top: 8px; }
#swp-section .swp-quick-add-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
#swp-section .swp-tag-row { display: flex; gap: 8px; }
#swp-section .swp-input { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.1);
  color: #fff; border: 1px solid transparent; transition: background 0.2s ease, border-color 0.2s ease;
  border-radius: 8px; padding: 12px; resize: vertical; font-family: inherit; font-size: 14px; line-height: 1.5; }
#swp-section .swp-input:focus { outline: none; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.15); }
#swp-section .swp-input::placeholder { color: rgba(255,255,255,0.5); }
#swp-section .swp-save-btn { margin-top: 12px; width: 100%; background: var(--spice-button, #1db954);
  color: #000; border: none; border-radius: 32px; padding: 12px; font-size: 14px;
  cursor: pointer; font-weight: 700; transition: transform 0.1s ease, filter 0.2s ease; }
#swp-section .swp-save-btn:hover { filter: brightness(1.1); transform: scale(1.02); }
#swp-section .swp-save-btn:active { transform: scale(0.98); }
#swp-section .swp-save-btn:disabled { opacity: .4; cursor: default; transform: none; filter: none; }
#swp-section .swp-data { display: flex; flex-direction: column; gap: 8px; }
#swp-section .swp-data button { background: rgba(255,255,255,0.1); color: #fff;
  border: none; border-radius: 32px; padding: 12px; font-size: 14px; font-weight: 700;
  cursor: pointer; text-align: center; transition: background 0.2s ease; }
#swp-section .swp-data button:hover { background: rgba(255,255,255,0.15); }
#swp-section .swp-hint { color: rgba(255,255,255,0.5); font-size: 13px; margin: 0; text-align: center; margin-top: 12px; }
#swp-section .swp-edit-actions { display: flex; gap: 8px; margin-top: 12px; }
#swp-section .swp-cancel-btn, #swp-section .swp-confirm button:last-of-type { flex: 1;
  background: rgba(255,255,255,0.1); color: #fff; font-weight: 700;
  border: none; border-radius: 32px; padding: 12px; cursor: pointer; transition: background 0.2s ease; }
#swp-section .swp-cancel-btn:hover, #swp-section .swp-confirm button:last-of-type:hover { background: rgba(255,255,255,0.15); }
#swp-section .swp-edit-actions .swp-save-btn { flex: 1; margin-top: 0; }
#swp-section .swp-confirm { display: flex; align-items: center; gap: 8px; margin-top: 16px;
  font-size: 13px; color: rgba(255,255,255,0.7); }
#swp-section .swp-confirm button { border-radius: 32px; padding: 8px 16px; cursor: pointer; font-weight: 700;
  border: none; font-size: 13px; transition: transform 0.1s ease, filter 0.2s ease; }
#swp-section .swp-confirm button:hover { filter: brightness(1.1); transform: scale(1.02); }
#swp-section .swp-confirm button:active { transform: scale(0.98); }
#swp-section .swp-confirm button:first-of-type { background: var(--spice-notification-error, #e91429);
  color: #fff; }
`;

const style = document.createElement("style");
style.id = "swp-styles";
style.textContent = CSS;
document.head.appendChild(style);

const state = {
  trackUri: null as string | null,
  notes: [] as Note[],
};

function persist() {
  if (!state.trackUri) return;
  saveNotes(state.trackUri, state.notes);
  registerTrack(state.trackUri);
}

function refresh() {
  state.trackUri = getCurrentTrackUri();
  state.notes = state.trackUri ? loadNotes(state.trackUri) : [];
}

function render() {
  const host = document.getElementById("swp-section");
  if (!host) return;
  if (isAd()) {
    ReactDOM.unmountComponentAtNode(host);
    host.style.display = "none";
    return;
  }
  host.style.display = "";
  
  const settings = loadSettings();
  const info = getTrackInfo() ?? { name: "Unknown", artist: "Unknown" };
  ReactDOM.render(
    React.createElement(NotePanel, {
      trackUri: state.trackUri,
      positionMs: getProgressMs(),
      notes: state.notes,
      defaultTag: settings.defaultTag,
      appMode: settings.appMode,
      onSaveSettings: (newSettings: any) => {
        saveSettings({ ...settings, ...newSettings });
        render();
      },
      onSave: (note: Note) => {
        state.notes = [...state.notes, note];
        persist();
        render();
      },
      onEdit: (note: Note, newText: string) => {
        state.notes = state.notes.map((n) =>
          n.id === note.id ? { ...n, text: newText, updatedAt: Date.now() } : n
        );
        persist();
        render();
      },
      onDelete: (note: Note) => {
        state.notes = state.notes.filter((n) => n.id !== note.id);
        persist();
        render();
      },
      onSeek: (ms: number) => seekTo(ms),
      onExportTrack: () => {
        const fmt = confirm("OK = .md, Cancel = .txt") ? ("md" as const) : ("txt" as const);
        const content = exportTrackNotes(info.artist, info.name, state.notes, fmt);
        downloadFile(`${info.artist} - ${info.name} [swp].${fmt}`, content);
      },
      onRestore: (file: File) => {
        file.text().then((text) => {
          const count = restoreAll(JSON.parse(text));
          alert(`Restored ${count} notes.`);
          refresh();
          render();
        });
      },
    }),
    host
  );
}

function mount(): boolean {
  const host =
    document.querySelector(".main-nowPlayingView-panel") ||
    document.querySelector(".main-nowPlayingView-nowPlayingWidget") ||
    document.querySelector(".main-nowPlayingView-container");
  if (!host) {
    const el = document.getElementById("swp-section");
    if (el) el.remove();
    return false;
  }
  let el = document.getElementById("swp-section");
  if (!el) {
    el = document.createElement("div");
    el.id = "swp-section";
    host.appendChild(el);
    refresh();
    console.log("[swp] mounted into Now Playing View");
  } else if (el.parentElement !== host) {
    host.appendChild(el);
  }
  render();
  return true;
}

async function main() {
  while (!(window as any).Spicetify?.Platform || !(window as any).Spicetify?.Player?.data) {
    await new Promise((r) => setTimeout(r, 300));
  }

  const settings = loadSettings();

  Spicetify.Mousetrap.bind(settings.shortcut, () => {
    (document.querySelector("#swp-section textarea") as HTMLTextAreaElement | null)?.focus();
  });

  mount();
  const observer = new MutationObserver(() => { mount(); });
  observer.observe(document.body, { childList: true, subtree: true });

  refresh();
  onTrackChange(() => {
    refresh();
    render();
  });

  if (!settings.onboarded) {
    try { Spicetify.showNotification?.("Songwriter's Pad ready in Now Playing View."); } catch {}
    saveSettings({ ...settings, onboarded: true });
  }

  console.log("[swp] initialized");
}

main().catch((err) => console.error("[swp] failed to initialize", err));
