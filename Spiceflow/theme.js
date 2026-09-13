(function Spiceflow() {
    let currentHover = null;
    let fetchTimer = null;
    const trackCache = new Map();

    const tooltip = document.createElement("div");
    tooltip.id = "spiceflow-tooltip";
    document.body.appendChild(tooltip);

    function extractMetadata(element) {
        let foundId = null;

        function searchNode(node) {
            if (foundId) return;
            const propKey = Object.keys(node).find(k => k.startsWith("__reactProps$"));
            if (!propKey) return;

            const seen = new Set();
            function traverse(obj, depth = 0) {
                if (foundId || depth > 5 || !obj || typeof obj !== 'object') return;
                if (seen.has(obj)) return;
                seen.add(obj);
                for (const key in obj) {
                    const val = obj[key];
                    if (typeof val === 'string' && val.includes('spotify:playlist:')) {
                        foundId = val.split(':').pop();
                        return;
                    }
                    if (val && typeof val === 'object') traverse(val, depth + 1);
                }
            }
            traverse(node[propKey]);
        }

        searchNode(element);
        if (!foundId) {
            const children = element.querySelectorAll("*");
            for (let i = 0; i < children.length; i++) {
                if (foundId) break;
                searchNode(children[i]);
            }
        }

        const uri = foundId ? `spotify:playlist:${foundId}` : null;
        const img = element.querySelector("img");
        const image = img ? img.src : "";
        const lines = element.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        const name = lines[0] || "Playlist";
        const subtitle = lines.find(l => l.includes("•"));
        const owner = subtitle ? subtitle.split("•")[1].trim() : "Spotify";

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
            let tracks = [];

            if (playlistApi) {
                // Use internal Spotify API (no rate limits)
                const contents = await playlistApi.getContents(targetUri);
                const items = contents?.items || [];
                
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
            } else {
                // Fallback to CosmosAsync if PlaylistAPI is missing
                const cosmos = window.Spicetify?.CosmosAsync;
                if (!cosmos) return;
                
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

            if (currentHover !== targetUri) return;
            const list = document.getElementById("spf-tracks-list");
            if (!list) return;

            trackCache.set(targetUri, tracks);
            list.innerHTML = renderTracks(tracks);
        } catch (e) {
            if (currentHover !== targetUri) return;
            const list = document.getElementById("spf-tracks-list");
            if (list) list.innerHTML = '<div class="spf-tracks-empty">Could not load tracks</div>';
        }
    }

    function setupListeners() {
        document.addEventListener("mouseover", (e) => {
            const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
            if (!item) return;

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
