(async function Spiceflow() {
    console.log("Spiceflow: Script injected and running!");

    while (!Spicetify?.CosmosAsync || !Spicetify?.Platform) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log("Spiceflow: Spicetify API ready!");

    const cache = new Map();
    let currentHover = null;
    let hoverTimeout = null;

    const tooltip = document.createElement("div");
    tooltip.id = "spiceflow-tooltip";
    document.body.appendChild(tooltip);

    async function fetchPlaylistTracks(uri) {
        if (cache.has(uri)) return cache.get(uri);
        try {
            const id = uri.split(":")[2];
            const data = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/playlists/${id}?fields=tracks.items(track(name))`);
            
            if (data.error) return null; // Silent fail if rate limited

            const tracks = data.tracks?.items?.slice(0, 3).map(i => i.track?.name).filter(Boolean);
            cache.set(uri, tracks);
            return tracks;
        } catch (e) {
            return null; // Silent fail
        }
    }

    function extractMetadata(element) {
        let uri = null;
        
        // 1. React Props Traversal untuk mencari URI
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

        searchNode(element);
        if (!foundId) {
            const children = element.querySelectorAll("*");
            for (let i = 0; i < children.length; i++) {
                if (foundId) break;
                searchNode(children[i]);
            }
        }
        
        if (foundId) uri = `spotify:playlist:${foundId}`;

        // 2. DOM Scraping untuk visual seketika (Instant Render)
        const img = element.querySelector("img");
        const image = img ? img.src : "";
        
        const lines = element.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        let name = lines[0] || "Unknown Playlist";
        let owner = "Spotify";
        
        // Contoh teks: "Playlist • Hamin"
        const subtitle = lines.find(l => l.includes("•"));
        if (subtitle) {
            owner = subtitle.split("•")[1].trim();
        }

        return { uri, name, owner, image };
    }

    document.addEventListener("mouseover", async (e) => {
        const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
        if (!item) return;

        const metadata = extractMetadata(item);
        if (!metadata.uri) return;

        if (currentHover === metadata.uri) return;

        currentHover = metadata.uri;
        if (hoverTimeout) clearTimeout(hoverTimeout);
        
        const rect = item.getBoundingClientRect();
        const tooltipHeight = 190; // Ukuran card di CSS
        
        // Coba posisikan sejajar tengah dengan item
        let topPos = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        
        // Cegah keluar layar atas
        if (topPos < 20) topPos = 20;
        
        // Cegah keluar layar bawah (terpotong)
        if (topPos + tooltipHeight > window.innerHeight - 20) {
            topPos = window.innerHeight - tooltipHeight - 20;
        }

        tooltip.style.top = `${topPos}px`;
        tooltip.style.left = `${rect.right + 15}px`;
        
        // INSTANT RENDER (0 detik)
        tooltip.innerHTML = `
            <div class="spiceflow-tooltip-content">
                ${metadata.image ? `<img src="${metadata.image}" class="spiceflow-cover" />` : ''}
                <div class="spiceflow-info">
                    <div class="spiceflow-title">${metadata.name}</div>
                    <div class="spiceflow-owner">Playlist • ${metadata.owner}</div>
                    <div class="spiceflow-tracks" id="spiceflow-tracks-container">
                        <span style="opacity: 0.5; font-size: 11px;">Mencari lagu...</span>
                    </div>
                </div>
            </div>
        `;
        tooltip.classList.add("visible");

        // BACKGROUND FETCH DENGAN DEBOUNCE (Mencegah Rate Limit)
        hoverTimeout = setTimeout(async () => {
            if (currentHover !== metadata.uri) return;

            const tracks = await fetchPlaylistTracks(metadata.uri);
            
            if (currentHover !== metadata.uri) return;

            const tracksContainer = document.getElementById("spiceflow-tracks-container");
            if (tracksContainer) {
                if (tracks && tracks.length > 0) {
                    tracksContainer.innerHTML = tracks.map((t, i) => `<span>${i+1}. ${t}</span>`).join("");
                } else {
                    // Silent fail (hilangkan teks loading, biarkan tooltip tetap cantik tanpa lagu)
                    tracksContainer.innerHTML = "";
                }
            }
        }, 500); 
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
