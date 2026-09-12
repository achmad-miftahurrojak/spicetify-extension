

declare const Spicetify: any;

export function getCurrentTrackUri(): string | null {
  const data = Spicetify.Player?.data;
  if (!data) return null;
  const track = data.track ?? data.item;
  return track?.uri ?? null;
}

export function isAd(): boolean {
  const data = Spicetify.Player?.data;
  if (!data) return false;
  const track = data.track ?? data.item;
  if (track?.metadata?.is_ad === "true" || track?.metadata?.is_ad === true) return true;
  if (track?.type === "ad") return true;
  const uri = track?.uri || "";
  return uri.startsWith("spotify:ad:");
}

export function getTrackInfo(): { name: string; artist: string; imageUrl?: string } | null {
  const data = Spicetify.Player?.data;
  if (!data) return null;
  const track = data.track ?? data.item;
  if (!track) return null;
  const name = track.metadata?.title ?? "Unknown";
  const artist = track.metadata?.artist_name ?? "Unknown";
  const imageUrl = track.metadata?.image_url ?? track.metadata?.image_large_url;
  return { name, artist, imageUrl };
}

export function getProgressMs(): number {
  return Spicetify.Player.getProgress() as number;
}

export function seekTo(ms: number): void {
  Spicetify.Player.seek(ms);
}

export function onTrackChange(callback: (trackUri: string | null) => void): () => void {
  Spicetify.Player.addEventListener("songchange", () => {
    callback(getCurrentTrackUri());
  });
  let last = getCurrentTrackUri();
  const interval = setInterval(() => {
    const current = getCurrentTrackUri();
    if (current !== last) {
      last = current;
      callback(current);
    }
  }, 2000);
  return () => clearInterval(interval);
}
