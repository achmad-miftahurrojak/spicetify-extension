(async function Spiceflow() {
    while (!Spicetify?.CosmosAsync || !Spicetify?.Platform) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const cache = new Map();
    let currentHover = null;

    // Create Tooltip DOM
    const tooltip = document.createElement("div");
    tooltip.id = "spiceflow-tooltip";
    document.body.appendChild(tooltip);

    async function fetchPlaylistData(uri) {
        if (cache.has(uri)) return cache.get(uri);
        try {
            const id = uri.split(":")[2];
            const data = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/playlists/${id}`);
            const result = {
                image: data.images?.[0]?.url,
                name: data.name,
                owner: data.owner?.display_name,
                tracks: data.tracks?.items?.slice(0, 3).map(i => i.track?.name).filter(Boolean)
            };
            cache.set(uri, result);
            return result;
        } catch (e) {
            console.error("Spiceflow error:", e);
            return null;
        }
    }

    document.addEventListener("mouseover", async (e) => {
        const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
        
        if (!item) {
            currentHover = null;
            tooltip.classList.remove("visible");
            return;
        }

        const link = item.querySelector('a[href^="/playlist/"]');
        if (!link) return;

        const urlParts = link.getAttribute("href").split("/");
        const id = urlParts[urlParts.length - 1];
        const uri = `spotify:playlist:${id}`;

        currentHover = uri;
        const rect = item.getBoundingClientRect();
        
        tooltip.innerHTML = `<div class="spiceflow-loading">Loading preview...</div>`;
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.left = `${rect.right + 15}px`;
        tooltip.classList.add("visible");

        const data = await fetchPlaylistData(uri);
        
        // Cek jika mouse masih di item yang sama
        if (currentHover !== uri || !data) {
            return;
        }

        let tracksHtml = data.tracks && data.tracks.length > 0 
            ? `<div class="spiceflow-tracks">` + data.tracks.map((t, i) => `<span>${i+1}. ${t}</span>`).join("") + `</div>`
            : "";

        tooltip.innerHTML = `
            <div class="spiceflow-tooltip-content">
                ${data.image ? `<img src="${data.image}" class="spiceflow-cover" />` : ''}
                <div class="spiceflow-info">
                    <div class="spiceflow-title">${data.name}</div>
                    <div class="spiceflow-owner">Playlist • ${data.owner || 'Spotify'}</div>
                    ${tracksHtml}
                </div>
            </div>
        `;
    });
})();
