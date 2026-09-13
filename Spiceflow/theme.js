(function Spiceflow() {
    let currentHover = null;
    let fetchTimer = null;
    const trackCache = new Map();

    const tooltip = document.createElement("div");
    tooltip.id = "spiceflow-tooltip";
    document.body.appendChild(tooltip);

    function extractMetadata(element) {
        let uri = null;
        
        // Performant O(1) DOM lookup instead of expensive deep React prop traversal
        const link = element.querySelector('a[href^="/playlist/"]');
        if (link) {
            // href is like "/playlist/37i9dQZF1DXcBWIGoYBM5M"
            const href = link.getAttribute('href');
            const id = href.split('/').pop();
            uri = `spotify:playlist:${id}`;
        }
        
        if (!uri) return { uri: null };

        const img = element.querySelector("img");
        const image = img ? img.src : "";
        const lines = element.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        const name = lines[0] || "Playlist";
        const subtitle = lines.find(l => l.includes("•") || l.includes("·"));
        const owner = subtitle ? subtitle.split(/•|·/)[1].trim() : "Spotify";

        return { uri, name, owner, image };
    }

    function renderBase(metadata) {
        return `
            <div class="spf-cover-wrap">
                ${metadata.image ? `<img src="${metadata.image}" class="spf-cover" />` : '<div class="spf-cover spf-cover-placeholder"></div>'}
                <div class="spf-cover-gradient"></div>
                <div class="spf-header-info">
                    <div class="spf-title">${metadata.name}</div>
                    <div class="spf-owner">Playlist · ${metadata.owner}</div>
                </div>
            </div>
            <div class="spf-tracks" id="spf-tracks-list">
                <div class="spf-tracks-loading">
                    <span class="spf-dot"></span><span class="spf-dot"></span><span class="spf-dot"></span>
                </div>
            </div>
        `;
    }

    function renderTracks(tracks) {
        if (!tracks || tracks.length === 0) {
            return '<div class="spf-tracks-empty">No tracks</div>';
        }
        return tracks.slice(0, 3).map((t, i) => `
            <div class="spf-track-row">
                <span class="spf-track-num">${i + 1}</span>
                <div class="spf-track-thumb-wrap">
                    ${t.image ? `<img class="spf-track-thumb" src="${t.image}" />` : '<div class="spf-track-thumb spf-track-thumb-empty"></div>'}
                </div>
                <div class="spf-track-meta">
                    <div class="spf-track-name">${t.name}</div>
                    <div class="spf-track-artist">${t.artist}</div>
                </div>
                <span class="spf-track-duration">${t.duration}</span>
            </div>
        `).join('');
    }

    function formatMs(ms) {
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }

    async function fetchTracks(playlistId, targetUri) {
        if (trackCache.has(targetUri)) {
            if (currentHover !== targetUri) return;
            const list = document.getElementById("spf-tracks-list");
            if (list) list.innerHTML = renderTracks(trackCache.get(targetUri));
            return;
        }

        try {
            const playlistApi = window.Spicetify?.Platform?.PlaylistAPI;
            const cosmos = window.Spicetify?.CosmosAsync;
            let tracks = null;

            if (playlistApi) {
                try {
                    const contents = await playlistApi.getContents(targetUri);
                    const items = contents?.items || [];
                    if (items.length > 0) {
                        tracks = items.slice(0, 3).map(i => {
                            const durationMs = i.duration?.milliseconds || 0;
                            const artists = i.artists ? i.artists.map(a => a.name).join(', ') : "Unknown Artist";
                            let img = "";
                            if (i.album?.images?.length > 0) {
                                img = i.album.images[0].url;
                            }
                            return {
                                name: i.name,
                                artist: artists,
                                image: img,
                                duration: formatMs(durationMs)
                            };
                        });
                    }
                } catch (err) {
                    console.error("Spiceflow: PlaylistAPI failed, falling back to Web API", err);
                }
            }

            if (!tracks && cosmos) {
                const res = await cosmos.get(
                    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=3&fields=items(track(name,duration_ms,artists,album(images)))`
                );
                
                tracks = (res.items || [])
                    .filter(i => i.track && i.track.name)
                    .map(i => ({
                        name: i.track.name,
                        artist: (i.track.artists || []).map(a => a.name).join(', '),
                        image: i.track.album?.images?.[2]?.url || i.track.album?.images?.[0]?.url || "",
                        duration: formatMs(i.track.duration_ms)
                    }));
            }

            if (!tracks) throw new Error("No tracks found");

            if (currentHover !== targetUri) return;
            const list = document.getElementById("spf-tracks-list");
            if (!list) return;

            trackCache.set(targetUri, tracks);
            list.innerHTML = renderTracks(tracks);
        } catch (e) {
            console.error("Spiceflow:", e);
            if (currentHover !== targetUri) return;
            const list = document.getElementById("spf-tracks-list");
            if (list) list.innerHTML = '<div class="spf-tracks-empty">Could not load tracks</div>';
        }
    }

    function setupListeners() {
        let currentItemNode = null;

        document.addEventListener("mouseover", (e) => {
            const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
            if (!item) return;
            if (item === currentItemNode) return;
            currentItemNode = item;

            const metadata = extractMetadata(item);
            if (!metadata.uri) return;
            if (currentHover === metadata.uri) return;

            currentHover = metadata.uri;
            clearTimeout(fetchTimer);

            const rect = item.getBoundingClientRect();
            const cardH = 280;
            let topPos = rect.top + (rect.height / 2) - (cardH / 2);
            if (topPos < 16) topPos = 16;
            if (topPos + cardH > window.innerHeight - 16) topPos = window.innerHeight - cardH - 16;

            tooltip.style.top = `${topPos}px`;
            tooltip.style.left = `${rect.right + 12}px`;
            tooltip.innerHTML = renderBase(metadata);
            tooltip.classList.add("visible");

            const playlistId = metadata.uri.split(':').pop();
            const capturedUri = metadata.uri;
            fetchTimer = setTimeout(() => fetchTracks(playlistId, capturedUri), 400);
        });

        document.addEventListener("mouseout", (e) => {
            const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
            if (item && !item.contains(e.relatedTarget)) {
                currentItemNode = null;
                currentHover = null;
                clearTimeout(fetchTimer);
                tooltip.classList.remove("visible");
            }
        });
    }

    async function waitForSpicetify() {
        while (!window.Spicetify?.CosmosAsync || !window.Spicetify?.Platform) {
            await new Promise(r => setTimeout(r, 300));
        }
        setupListeners();
    }

    waitForSpicetify();
})();
