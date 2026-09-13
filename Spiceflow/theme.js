(function Spiceflow() {
    let currentHover = null; // URI of currently open modal
    let fetchTimer = null;
    let hideTimer = null;
    const trackCache = new Map();

    const tooltip = document.createElement("div");
    tooltip.id = "spiceflow-tooltip";
    document.body.appendChild(tooltip);

    // Keep modal open when hovering over it
    tooltip.addEventListener("mouseenter", () => {
        clearTimeout(hideTimer);
    });

    // Close modal when mouse leaves the modal
    tooltip.addEventListener("mouseleave", () => {
        closeModal();
    });

    // Close modal on Esc key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && tooltip.classList.contains("visible")) {
            closeModal();
        }
    });

    function closeModal() {
        currentHover = null;
        clearTimeout(fetchTimer);
        clearTimeout(hideTimer);
        tooltip.classList.remove("visible");
    }

    // Play button SVG
    const playIconSvg = `<svg viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>`;
    const playIconSmallSvg = `<svg viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>`;
    const speakerIconSvg = `<svg viewBox="0 0 24 24"><path d="M12 3v18l-8-6H0V9h4l8-6zm6.5 12a4.5 4.5 0 0 0 0-6v6zm3 4a8.5 8.5 0 0 0 0-14v14z"></path></svg>`; // Approximate speaker
    const shuffleIconSvg = `<svg viewBox="0 0 16 16"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5zM15.98 12.25L13.151 15.078a.75.75 0 1 1-1.06-1.06l1.018-1.018H11.16a2.25 2.25 0 0 1-1.724-.804l-1.796-2.14.98-1.167 1.638 1.951a3.75 3.75 0 0 0 2.873 1.34h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828z"></path></svg>`;
    const dotsIconSvg = `<svg viewBox="0 0 24 24"><path d="M4.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm15 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path></svg>`;

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
            <div class="spf-meta" id="spf-meta-info"></div>
            <div class="spf-action-bar">
                <button class="spf-play-btn" onclick="window.Spicetify.Player.playUri('${metadata.uri}')">
                    ${playIconSvg} Play
                </button>
                <button class="spf-icon-btn" onclick="window.Spicetify.Player.setShuffle(true); setTimeout(() => window.Spicetify.Player.playUri('${metadata.uri}'), 100)">
                    ${shuffleIconSvg}
                </button>
                <button class="spf-icon-btn">
                    ${dotsIconSvg}
                </button>
            </div>
            <div class="spf-tracks" id="spf-tracks-list">
                <div class="spf-tracks-loading">
                    <span class="spf-dot"></span><span class="spf-dot"></span><span class="spf-dot"></span>
                </div>
            </div>
        `;
    }

    function renderTracks(tracksData, playlistUri) {
        if (!tracksData || !tracksData.items || tracksData.items.length === 0) {
            return '<div class="spf-tracks-empty">No tracks</div>';
        }
        
        const playingUri = window.Spicetify?.Player?.data?.item?.uri || window.Spicetify?.Player?.data?.track?.uri;

        return tracksData.items.map((t, i) => {
            const isActive = playingUri === t.uri;
            const activeClass = isActive ? 'active' : '';
            return `
                <div class="spf-track-row ${activeClass}" onclick="window.Spicetify.Player.playUri('${t.uri}', { context: '${playlistUri}' })">
                    <div class="spf-track-num-wrap">
                        <span class="spf-track-num">${i + 1}</span>
                        <div class="spf-track-play-icon">${playIconSmallSvg}</div>
                        <div class="spf-track-active-icon">${speakerIconSvg}</div>
                    </div>
                    <div class="spf-track-thumb-wrap">
                        ${t.image ? `<img class="spf-track-thumb" src="${t.image}" />` : '<div class="spf-track-thumb spf-track-thumb-empty"></div>'}
                    </div>
                    <div class="spf-track-meta">
                        <div class="spf-track-name">${t.name}</div>
                        <div class="spf-track-artist">${t.artist}</div>
                    </div>
                    <span class="spf-track-duration">${t.duration}</span>
                </div>
            `;
        }).join('');
    }

    function formatMs(ms) {
        const s = Math.floor(ms / 1000);
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }

    async function fetchTracks(playlistId, targetUri) {
        if (trackCache.has(targetUri)) {
            if (currentHover !== targetUri) return;
            updateModalData(targetUri, trackCache.get(targetUri));
            return;
        }

        try {
            const playlistApi = window.Spicetify?.Platform?.PlaylistAPI;
            const cosmos = window.Spicetify?.CosmosAsync;
            let tracksData = null;

            if (playlistApi) {
                try {
                    const contents = await playlistApi.getContents(targetUri);
                    const items = contents?.items || [];
                    if (items.length > 0) {
                        const mappedItems = items.slice(0, 6).map(i => {
                            const durationMs = i.duration?.milliseconds || 0;
                            const artists = i.artists ? i.artists.map(a => a.name).join(', ') : "Unknown Artist";
                            let img = "";
                            if (i.album?.images?.length > 0) {
                                img = i.album.images[0].url;
                            }
                            return {
                                uri: i.uri,
                                name: i.name,
                                artist: artists,
                                image: img,
                                duration: formatMs(durationMs)
                            };
                        });
                        
                        tracksData = {
                            items: mappedItems,
                            totalCount: items.length
                        };
                    }
                } catch (err) {
                    console.error("Spiceflow: PlaylistAPI failed", err);
                }
            }

            if (!tracksData && cosmos) {
                const res = await cosmos.get(
                    `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks(total,items(track(uri,name,duration_ms,artists,album(images))))`
                );
                
                const items = res.tracks?.items || [];
                const totalCount = res.tracks?.total || 0;
                
                const mappedItems = items.slice(0, 6)
                    .filter(i => i.track && i.track.name)
                    .map(i => ({
                        uri: i.track.uri,
                        name: i.track.name,
                        artist: (i.track.artists || []).map(a => a.name).join(', '),
                        image: i.track.album?.images?.[2]?.url || i.track.album?.images?.[0]?.url || "",
                        duration: formatMs(i.track.duration_ms)
                    }));
                    
                tracksData = {
                    items: mappedItems,
                    totalCount: totalCount
                };
            }

            if (!tracksData) throw new Error("No tracks found");

            trackCache.set(targetUri, tracksData);
            if (currentHover !== targetUri) return;
            updateModalData(targetUri, tracksData);
        } catch (e) {
            console.error("Spiceflow:", e);
            if (currentHover !== targetUri) return;
            const list = document.getElementById("spf-tracks-list");
            if (list) list.innerHTML = '<div class="spf-tracks-empty">Could not load tracks</div>';
        }
    }
    
    function updateModalData(playlistUri, tracksData) {
        const list = document.getElementById("spf-tracks-list");
        const meta = document.getElementById("spf-meta-info");
        
        if (list) list.innerHTML = renderTracks(tracksData, playlistUri);
        if (meta) {
            meta.innerText = `${tracksData.totalCount} songs`;
        }
    }

    function setupListeners() {
        let currentItemNode = null;

        document.addEventListener("mouseover", (e) => {
            const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
            if (!item) return;
            if (item === currentItemNode) {
                clearTimeout(hideTimer);
                return;
            }
            currentItemNode = item;

            const metadata = extractMetadata(item);
            if (!metadata.uri) return;
            
            clearTimeout(hideTimer);
            
            if (currentHover === metadata.uri) return;
            currentHover = metadata.uri;
            clearTimeout(fetchTimer);

            const rect = item.getBoundingClientRect();
            const cardH = 420; // Fixed max height
            
            // "patenkan berada di tengah app tapi tetap disebelah sidebar ... pas tengah dan rata kiri"
            const topPos = (window.innerHeight / 2) - (cardH / 2);
            
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
                clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    closeModal();
                }, 600); // Increased to 600ms to allow mouse to travel to centered modal
            }
        });
    }

    async function waitForSpicetify() {
        while (!window.Spicetify?.CosmosAsync || !window.Spicetify?.Platform || !window.Spicetify?.Player) {
            await new Promise(r => setTimeout(r, 300));
        }
        setupListeners();
    }

    waitForSpicetify();
})();
