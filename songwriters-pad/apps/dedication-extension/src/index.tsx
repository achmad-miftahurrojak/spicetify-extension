import { FirebaseTransport } from '@dedication/transport';

// 1. Friend Code Generation
const SAFE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude O, 0, I, 1

function generateFriendCode(): string {
    let code = '';
    for (let i = 0; i < 8; i++) {
        if (i === 4) code += '-';
        code += SAFE_ALPHABET[Math.floor(Math.random() * SAFE_ALPHABET.length)];
    }
    return code; // e.g. "X7A9-K3M8"
}

function getOrGenerateFriendCode(): string {
    let code = Spicetify.LocalStorage.get("dedication:friend_code");
    if (!code) {
        code = generateFriendCode();
        Spicetify.LocalStorage.set("dedication:friend_code", code);
    }
    return code;
}

// 2. Context Menu
function registerContextMenu(transport: FirebaseTransport) {
    new Spicetify.ContextMenu.Item(
        "Send Dedication",
        async (uris: string[]) => {
            if (uris.length === 0) return;
            const uri = uris[0];
            openSendModal(uri, transport);
        },
        (uris: string[]) => uris.length > 0 && uris[0].includes("track"), // shouldAdd
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    ).register();
}

function SendModalContent({ trackUri, transport, onClose }: { trackUri: string, transport: FirebaseTransport, onClose: () => void }) {
    const fStr = Spicetify.LocalStorage.get("dedication:friends");
    const friends: {name: string, code: string}[] = fStr ? JSON.parse(fStr) : [];
    
    const [selectedCode, setSelectedCode] = Spicetify.React.useState(friends.length > 0 ? friends[0].code : "");
    const [manualCode, setManualCode] = Spicetify.React.useState("");
    const [isManual, setIsManual] = Spicetify.React.useState(friends.length === 0);
    const [fromName, setFromName] = Spicetify.React.useState("");
    const [message, setMessage] = Spicetify.React.useState("");
    const [isSending, setIsSending] = Spicetify.React.useState(false);

    const handleSend = async () => {
        const targetCode = isManual ? manualCode.toUpperCase() : selectedCode;
        if (!targetCode || !message) {
            try { Spicetify.showNotification?.(String("Friend code and message are required.")); } catch {}
            return;
        }

        setIsSending(true);
        
        let meta: any = {};
        try {
            const currentTrack = Spicetify.Player.data.track || Spicetify.Player.data.item;
            const getTrackId = (u?: string) => u?.split(':')[2]?.split('?')[0];
            const currentId = getTrackId(currentTrack?.uri);
            const targetId = getTrackId(trackUri);

            if (currentId && targetId && currentId === targetId) {
                const m = currentTrack.metadata;
                meta = {
                    trackName: m.title || m.name || "",
                    artistName: m.artist_name || "",
                    coverUrl: m.image_xlarge_url || m.image_large_url || m.image_url || ""
                };
            } else {
                const trackId = trackUri.split(':')[2];
                if (trackId) {
                    const res = await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/tracks/' + trackId);
                    const coverUrl = res.album?.images?.[0]?.url;
                    meta = {
                        trackName: res.name || "",
                        artistName: res.artists?.[0]?.name || "",
                        coverUrl: coverUrl || ""
                    };
                }
            }
        } catch (e) {
            console.error("Failed to fetch metadata before sending", e);
        }

        if (!meta.trackName) {
            try { Spicetify.showNotification?.(String("Cannot fetch track info. Play the track first to send.")); } catch {}
            setIsSending(false);
            return;
        }

        const success = await transport.sendDedication(targetCode, {
            trackUri,
            message,
            fromName: fromName || 'Anonymous',
            timestamp: Date.now(),
            ...meta
        });
        setIsSending(false);
        
        onClose();
        if (success) {
            try { Spicetify.showNotification?.(String("Dedication sent successfully!")); } catch {}
        } else {
            try { Spicetify.showNotification?.(String("Failed to send dedication.")); } catch {}
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {friends.length > 0 && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setIsManual(false)} 
                        style={{ flex: 1, padding: '8px', background: !isManual ? 'var(--spice-button)' : 'transparent', color: !isManual ? 'var(--spice-button-text)' : 'var(--spice-text)', border: '1px solid var(--spice-button)', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Address Book
                    </button>
                    <button 
                        onClick={() => setIsManual(true)} 
                        style={{ flex: 1, padding: '8px', background: isManual ? 'var(--spice-button)' : 'transparent', color: isManual ? 'var(--spice-button-text)' : 'var(--spice-text)', border: '1px solid var(--spice-button)', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Manual Code
                    </button>
                </div>
            )}
            
            {!isManual && friends.length > 0 ? (
                <select 
                    value={selectedCode} 
                    onChange={e => setSelectedCode(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', background: 'var(--spice-sidebar)', color: 'var(--spice-text)', border: '1px solid var(--spice-button)' }}
                >
                    {friends.map(f => (
                        <option key={f.code} value={f.code}>{f.name} ({f.code})</option>
                    ))}
                </select>
            ) : (
                <input 
                    placeholder="Friend Code (e.g. ABCD-1234)"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value.toUpperCase())}
                    style={{ padding: '8px', borderRadius: '4px', background: 'var(--spice-sidebar)', color: 'var(--spice-text)', border: '1px solid var(--spice-button)' }}
                    maxLength={9}
                />
            )}

            <input 
                placeholder="Your Name (or Anonymous)"
                value={fromName}
                onChange={e => setFromName(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', background: 'var(--spice-sidebar)', color: 'var(--spice-text)', border: '1px solid var(--spice-button)' }}
                maxLength={30}
            />
            <textarea 
                placeholder="Your Message (Max 140 chars)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', background: 'var(--spice-sidebar)', color: 'var(--spice-text)', border: '1px solid var(--spice-button)', resize: 'none', height: '60px' }}
                maxLength={140}
            />
            <button 
                onClick={handleSend}
                disabled={isSending}
                style={{ padding: '10px', background: 'var(--spice-button)', color: 'var(--spice-button-text)', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', opacity: isSending ? 0.5 : 1 }}
            >
                {isSending ? "Sending..." : "Send"}
            </button>
        </div>
    );
}

function openSendModal(trackUri: string, transport: FirebaseTransport) {
    const container = document.createElement('div');
    Spicetify.PopupModal.display({
        title: "Send a Dedication",
        content: container as any
    });
    
    Spicetify.ReactDOM.render(
        <SendModalContent 
            trackUri={trackUri} 
            transport={transport} 
            onClose={() => {
                Spicetify.PopupModal.hide();
                setTimeout(() => Spicetify.ReactDOM.unmountComponentAtNode(container), 200);
            }} 
        />,
        container
    );
}

// 5. Entry
(async function main() {
    while (!Spicetify?.showNotification || !Spicetify?.ReactDOM) {
        await new Promise(r => setTimeout(r, 100));
    }

    const myCode = getOrGenerateFriendCode();
    console.log(`[Dedication] My Friend Code: ${myCode}`);
    


    const transport = new FirebaseTransport({
        databaseUrl: "https://dedication-spicetify-default-rtdb.firebaseio.com"
    });

    registerContextMenu(transport);

    // Listen for incoming messages
    // Note: We need to re-bind if the code changes, but for now we just use the current code.
    // Ideally we should track the listener and un-listen, but Firebase realtime handles reconnection.
    transport.listen(myCode, (msg: any) => {
        const seenStr = Spicetify.LocalStorage.get("dedication:seen");
        const seen = seenStr ? JSON.parse(seenStr) : {};
        if (seen[msg.id]) return;
        
        seen[msg.id] = true;
        Spicetify.LocalStorage.set("dedication:seen", JSON.stringify(seen));

        const inboxStr = Spicetify.LocalStorage.get("dedication:inbox");
        const inbox = inboxStr ? JSON.parse(inboxStr) : [];
        inbox.unshift(msg);
        Spicetify.LocalStorage.set("dedication:inbox", JSON.stringify(inbox));

        try { Spicetify.showNotification?.(String(`New dedication from ${msg.fromName || 'Someone'}! Check your Inbox.`)); } catch {}
        
        transport.deleteDedication(myCode, msg.id);
    });
})();
