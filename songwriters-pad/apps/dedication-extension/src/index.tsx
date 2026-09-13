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

// 2. Context Menu & Quick Send
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

    window.addEventListener('dedication:quick_send', ((e: CustomEvent) => {
        const friendCode = e.detail?.friendCode;
        const currentTrack = Spicetify.Player.data.track || Spicetify.Player.data.item;
        if (!currentTrack || !currentTrack.uri.includes('track')) {
            try { Spicetify.showNotification?.(String("Play a track first to send a dedication!")); } catch {}
            return;
        }
        openSendModal(currentTrack.uri, transport, friendCode);
    }) as EventListener);
}

function SendModalContent({ trackUri, transport, initialFriendCode, onClose }: { trackUri: string, transport: FirebaseTransport, initialFriendCode?: string, onClose: () => void }) {
    const fStr = Spicetify.LocalStorage.get("dedication:friends");
    const friends: {name: string, code: string, avatar?: string}[] = fStr ? JSON.parse(fStr) : [];
    
    const [selectedCode, setSelectedCode] = Spicetify.React.useState(initialFriendCode || (friends.length > 0 ? friends[0].code : ""));
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

        let senderAvatar = "";
        let finalFromName = fromName;
        try {
            const userApi = Spicetify.Platform?.UserAPI;
            const user = userApi?.getUser ? await userApi.getUser() : (userApi?._state || null);
            if (user) {
                senderAvatar = user.images?.[0]?.url || user.avatar_url || user.profile_image || user.picture || "";
                if (!finalFromName) finalFromName = user.displayName || user.name || user.username || "";
            }
        } catch(e) {}

        const success = await transport.sendDedication(targetCode, {
            trackUri,
            message,
            fromName: finalFromName || 'Anonymous',
            senderAvatar,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
            {friends.length > 0 && (
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                    <button 
                        onClick={() => setIsManual(false)} 
                        style={{ flex: 1, padding: '8px 12px', background: !isManual ? 'var(--spice-button)' : 'transparent', color: !isManual ? 'var(--spice-button-text)' : 'var(--spice-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.15s' }}
                    >
                        Address Book
                    </button>
                    <button 
                        onClick={() => setIsManual(true)} 
                        style={{ flex: 1, padding: '8px 12px', background: isManual ? 'var(--spice-button)' : 'transparent', color: isManual ? 'var(--spice-button-text)' : 'var(--spice-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.15s' }}
                    >
                        Manual Code
                    </button>
                </div>
            )}
            
            {!isManual && friends.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--spice-subtext)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Friend</label>
                    <select 
                        value={selectedCode} 
                        onChange={e => setSelectedCode(e.target.value)}
                        style={{ padding: '0 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '14px', outline: 'none', height: '44px', boxSizing: 'border-box' }}
                    >
                        {friends.map(f => (
                            <option key={f.code} value={f.code} style={{ background: 'var(--spice-card)' }}>{f.name} ({f.code})</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--spice-subtext)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Friend Code</label>
                    <input 
                        placeholder="e.g. ABCD-1234"
                        value={manualCode}
                        onChange={e => setManualCode(e.target.value.toUpperCase())}
                        style={{ padding: '0 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontFamily: 'monospace', outline: 'none', height: '44px', boxSizing: 'border-box' }}
                        maxLength={9}
                    />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--spice-subtext)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sender Name</label>
                <input 
                    placeholder="Your Name (or Anonymous)"
                    value={fromName}
                    onChange={e => setFromName(e.target.value)}
                    style={{ padding: '0 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', height: '44px', boxSizing: 'border-box' }}
                    maxLength={30}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: 'var(--spice-subtext)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</label>
                <textarea 
                    placeholder="Type your message here... (Max 140 chars)"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)', border: '1px solid rgba(255,255,255,0.1)', resize: 'none', height: '80px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    maxLength={140}
                />
            </div>

            <button 
                onClick={handleSend}
                disabled={isSending || (!isManual && !selectedCode) || (isManual && manualCode.length < 9) || !message}
                style={{ 
                    marginTop: '8px',
                    padding: '12px 24px', 
                    background: (isSending || (!isManual && !selectedCode) || (isManual && manualCode.length < 9) || !message) ? 'var(--spice-highlight-elevated)' : 'var(--spice-button)', 
                    color: (isSending || (!isManual && !selectedCode) || (isManual && manualCode.length < 9) || !message) ? 'var(--spice-subtext)' : 'var(--spice-button-text)', 
                    borderRadius: '32px', 
                    border: 'none', 
                    cursor: (isSending || (!isManual && !selectedCode) || (isManual && manualCode.length < 9) || !message) ? 'default' : 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '14px',
                    transition: 'all 0.15s ease'
                }}
            >
                {isSending ? "Sending..." : "Send Dedication"}
            </button>
        </div>
    );
}

function openSendModal(trackUri: string, transport: FirebaseTransport, initialFriendCode?: string) {
    const container = document.createElement('div');
    Spicetify.PopupModal.display({
        title: "Send a Dedication",
        content: container as any
    });
    
    Spicetify.ReactDOM.render(
        <SendModalContent 
            trackUri={trackUri} 
            transport={transport} 
            initialFriendCode={initialFriendCode}
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
