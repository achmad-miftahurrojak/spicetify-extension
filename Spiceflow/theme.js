(function Spiceflow() {
    console.log("Spiceflow: Script injected and running!");

    let currentHover = null;

    const tooltip = document.createElement("div");
    tooltip.id = "spiceflow-tooltip";
    document.body.appendChild(tooltip);

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

    document.addEventListener("mouseover", (e) => {
        const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
        if (!item) return;

        const metadata = extractMetadata(item);
        if (!metadata.uri) return;

        if (currentHover === metadata.uri) return;

        currentHover = metadata.uri;
        
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
        
        // INSTANT RENDER (0 detik) - Hapus bagian list track
        tooltip.innerHTML = `
            <div class="spiceflow-tooltip-content">
                ${metadata.image ? `<img src="${metadata.image}" class="spiceflow-cover" />` : ''}
                <div class="spiceflow-info">
                    <div class="spiceflow-title">${metadata.name}</div>
                    <div class="spiceflow-owner">Playlist • ${metadata.owner}</div>
                </div>
            </div>
        `;
        tooltip.classList.add("visible");
    });

    document.addEventListener("mouseout", (e) => {
        const item = e.target.closest(".main-yourLibraryX-listItem, .main-rootlist-rootlistItem");
        if (item && !item.contains(e.relatedTarget)) {
            currentHover = null;
            tooltip.classList.remove("visible");
        }
    });
})();
