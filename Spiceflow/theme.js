(async function Spiceflow() {
    console.log("Spiceflow: Script injected and running!");

    while (!Spicetify?.CosmosAsync || !Spicetify?.Platform) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log("Spiceflow: Spicetify API ready!");

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
            console.log("Spiceflow: Fetching data for", id);
            const data = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/playlists/${id}`);
            
            if (data.error || !data.name) {
                console.error("Spiceflow API Error:", data.error);
                return { error: true, message: data.error?.message || "Gagal memuat data" };
            }

            const result = {
                image: data.images?.[0]?.url,
                name: data.name,
                owner: data.owner?.display_name,
                tracks: data.tracks?.items?.slice(0, 3).map(i => i.track?.name).filter(Boolean)
            };
            cache.set(uri, result);
            return result;
        } catch (e) {
            console.error("Spiceflow error fetching data:", e);
            return { error: true, message: "Terjadi kesalahan koneksi" };
        }
    }

    function findPlaylistId(element) {
        // Coba 1: a[href]
        const link = element.querySelector("a[href*='playlist']");
        if (link) {
            const href = link.getAttribute("href");
            const parts = href.split(/[:/]/);
            return parts[parts.length - 1].split('?')[0];
        }

        // Coba 2: React Props Traversal (Spicetify Hack)
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
                    if (val && typeof val === 'object') {
                        traverse(val, depth + 1);
                    }
                }
            }
            traverse(node[propKey]);
        }

        // Cek elemen root
        searchNode(element);
        if (foundId) return foundId;

        // Cek semua children (terkadang props ada di elemen div bagian dalam)
        const children = element.querySelectorAll("*");
        for (let i = 0; i < children.length; i++) {
            if (foundId) break;
            searchNode(children[i]);
        }

        return foundId;
    }

    let hoverTimeout = null;

    document.addEventListener("mouseover", async (e) => {
        const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
        
        if (!item) return;

        const id = findPlaylistId(item);
        if (!id) return;

        const uri = `spotify:playlist:${id}`;
        
        if (currentHover === uri) return;

        currentHover = uri;
        if (hoverTimeout) clearTimeout(hoverTimeout);
        tooltip.classList.remove("visible");
        
        hoverTimeout = setTimeout(async () => {
            if (currentHover !== uri) return;

            console.log("Spiceflow: Fetching for URI:", uri);
            const rect = item.getBoundingClientRect();
            
            tooltip.innerHTML = `<div class="spiceflow-loading">Loading preview...</div>`;
            tooltip.style.top = `${rect.top}px`;
            tooltip.style.left = `${rect.right + 15}px`;
            tooltip.classList.add("visible");

            const data = await fetchPlaylistData(uri);
            
            if (currentHover !== uri || !data) {
                if (currentHover !== uri) tooltip.classList.remove("visible");
                return;
            }

            if (data.error) {
                tooltip.innerHTML = `
                    <div class="spiceflow-tooltip-content">
                        <div class="spiceflow-info">
                            <div class="spiceflow-title" style="color: #ff5555;">Gagal Memuat</div>
                            <div class="spiceflow-owner">Server menolak (Mungkin Rate Limit). Tunggu beberapa menit.</div>
                        </div>
                    </div>
                `;
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
        }, 500); // Tunggu 500ms sebelum fetch data
    });

    document.addEventListener("mouseout", (e) => {
        const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
        if (item && !item.contains(e.relatedTarget)) {
            if (hoverTimeout) clearTimeout(hoverTimeout);
            currentHover = null;
            tooltip.classList.remove("visible");
        }
    });
})();
