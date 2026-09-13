import { DedicationPayload } from '@dedication/transport';

// 5. Full Postcard Modal
function showPostcardModal(msg: any, meta: any) {
    const coverUrl = meta?.album?.images?.[0]?.url;
    const trackName = meta?.name || (meta?.loading ? "Loading..." : "Unknown Track");
    const artistName = meta?.artists?.[0]?.name || "";

    Spicetify.PopupModal.display({
        title: "A Dedication For You",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '200px', height: '200px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                    {coverUrl ? <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%', height:'100%', background:'var(--spice-main)'}}/>}
                </div>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px', color: 'var(--spice-text)' }}>{trackName}</h2>
                    <span style={{ fontSize: '16px', color: 'var(--spice-subtext)' }}>{artistName}</span>
                </div>
                <div style={{ background: 'var(--spice-card)', padding: '24px', borderRadius: '12px', width: '100%', fontStyle: 'italic', fontSize: '16px', lineHeight: '1.5' }}>
                    "{msg.message}"
                </div>
                <div style={{ color: 'var(--spice-subtext)', fontSize: '14px' }}>
                    Sent by <strong style={{color:'var(--spice-text)'}}>{msg.fromName}</strong> on {new Date(msg.timestamp).toLocaleDateString()}
                </div>
                <button 
                    onClick={() => {
                        try {
                            if (typeof Spicetify.addToQueue === 'function') {
                                Spicetify.addToQueue([{ uri: msg.trackUri }]);
                            } else if (Spicetify.Platform?.PlayerAPI?.addToQueue) {
                                Spicetify.Platform.PlayerAPI.addToQueue([{ uri: msg.trackUri }]);
                            } else {
                                Spicetify.Player.playUri(msg.trackUri);
                            }
                            Spicetify.showNotification("Added to queue!");
                        } catch (e) {
                            Spicetify.Player.playUri(msg.trackUri);
                            Spicetify.showNotification("Playing now...");
                        }
                        Spicetify.PopupModal.hide();
                    }}
                    style={{
                        background: 'var(--spice-button)', color: 'var(--spice-button-text)',
                        border: 'none', padding: '14px 32px', borderRadius: '32px',
                        fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    Add to Queue
                </button>
            </div>
        ) as any
    });
}

function App() {
    const [inbox, setInbox] = Spicetify.React.useState<any[]>([]);
    const [tracksMeta, setTracksMeta] = Spicetify.React.useState<Record<string, any>>({});
    const [friendCode, setFriendCode] = Spicetify.React.useState(Spicetify.LocalStorage.get("dedication:friend_code") || "Unknown");
    const [readState, setReadState] = Spicetify.React.useState<Record<string, boolean>>({});
    
    // Address Book State
    const [friends, setFriends] = Spicetify.React.useState<{name: string, code: string, addedAt?: number}[]>([]);
    const [newFriendName, setNewFriendName] = Spicetify.React.useState("");
    const [newFriendCode, setNewFriendCode] = Spicetify.React.useState("");
    const [showHowItWorks, setShowHowItWorks] = Spicetify.React.useState(false);

    Spicetify.React.useEffect(() => {
        const handleCodeChange = () => setFriendCode(Spicetify.LocalStorage.get("dedication:friend_code") || "Unknown");
        window.addEventListener('dedication:code_changed', handleCodeChange);
        return () => window.removeEventListener('dedication:code_changed', handleCodeChange);
    }, []);

    Spicetify.React.useEffect(() => {
        const loadInbox = () => {
            const dataStr = Spicetify.LocalStorage.get("dedication:inbox");
            if (dataStr) setInbox(JSON.parse(dataStr));
            
            const readStr = Spicetify.LocalStorage.get("dedication:read");
            if (readStr) setReadState(JSON.parse(readStr));
            
            const fStr = Spicetify.LocalStorage.get("dedication:friends");
            if (fStr) setFriends(JSON.parse(fStr));
        };

        loadInbox();
        const interval = setInterval(loadInbox, 2000);
        return () => clearInterval(interval);
    }, []);

    Spicetify.React.useEffect(() => {
        inbox.forEach(async (msg) => {
            if (!tracksMeta[msg.trackUri] && msg.trackUri) {
                // Prevent duplicate fetches while pending
                setTracksMeta(prev => ({ ...prev, [msg.trackUri]: { loading: true } }));
                const trackId = msg.trackUri.split(':')[2];
                if (!trackId) return;
                try {
                    const res = await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/tracks/' + trackId);
                    if (res && (res.error || res.status >= 400)) {
                        throw new Error("Rate limit or API error");
                    }
                    setTracksMeta(prev => ({ ...prev, [msg.trackUri]: res }));
                } catch (e) {
                    console.error("Failed to fetch track meta from API, falling back to internal", e);
                    try {
                        const res = await Spicetify.CosmosAsync.get('wg://track/v1/' + trackId);
                        const coverId = res.album?.coverGroup?.image?.[0]?.fileId;
                        const coverUrl = coverId ? `https://i.scdn.co/image/${coverId.toLowerCase()}` : '';
                        setTracksMeta(prev => ({ ...prev, [msg.trackUri]: {
                            name: res.name,
                            artists: res.artist,
                            album: { images: [{ url: coverUrl }] }
                        } }));
                    } catch (e2) {
                        setTracksMeta(prev => ({ ...prev, [msg.trackUri]: { error: true } }));
                    }
                }
            }
        });
    }, [inbox]);

    const copyCode = () => {
        Spicetify.Platform.ClipboardAPI.copy(friendCode);
        Spicetify.showNotification("Friend code copied!");
    };

    const regenerateCode = () => {
        if (confirm("Kode lama berhenti berfungsi. Dedication yang belum kebaca akan hilang. Yakin?")) {
            const SAFE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let newCode = '';
            for (let i = 0; i < 8; i++) {
                if (i === 4) newCode += '-';
                newCode += SAFE_ALPHABET[Math.floor(Math.random() * SAFE_ALPHABET.length)];
            }
            Spicetify.LocalStorage.set("dedication:friend_code", newCode);
            window.dispatchEvent(new CustomEvent('dedication:code_changed'));
            Spicetify.showNotification(`Regenerated! New Code: ${newCode}`);
            window.dispatchEvent(new CustomEvent('dedication:rebind_transport', { detail: newCode }));
        }
    };

    const markAsRead = (msgId: string) => {
        const newReadState = { ...readState, [msgId]: true };
        setReadState(newReadState);
        Spicetify.LocalStorage.set("dedication:read", JSON.stringify(newReadState));
    };

    const addFriend = () => {
        if (!newFriendName || !newFriendCode) return;
        const code = newFriendCode.toUpperCase();
        
        // Validation: 8 chars, hyphen in middle, safe alphabet
        if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code)) {
            Spicetify.showNotification("Invalid code. Use format XXXX-XXXX (letters & numbers 2-9 only).", true);
            return;
        }

        // Duplicate Code check
        const existingCode = friends.find(f => f.code === code);
        if (existingCode) {
            Spicetify.showNotification(`Code already saved as ${existingCode.name}.`, true);
            return;
        }

        // Duplicate Name check
        const existingNameIndex = friends.findIndex(f => f.name.toLowerCase() === newFriendName.toLowerCase());
        if (existingNameIndex !== -1) {
            if (!confirm(`You already have a friend named ${newFriendName}. Overwrite their code?`)) {
                return;
            }
            const newFriends = [...friends];
            newFriends[existingNameIndex] = { name: newFriendName, code, addedAt: Date.now() };
            setFriends(newFriends);
            Spicetify.LocalStorage.set("dedication:friends", JSON.stringify(newFriends));
            setNewFriendName("");
            setNewFriendCode("");
            Spicetify.showNotification(`Friend updated!`);
            return;
        }

        const newFriends = [...friends, { name: newFriendName, code, addedAt: Date.now() }];
        setFriends(newFriends);
        Spicetify.LocalStorage.set("dedication:friends", JSON.stringify(newFriends));
        setNewFriendName("");
        setNewFriendCode("");
        Spicetify.showNotification(`Friend ${newFriendName} saved!`);
    };

    const removeFriend = (idx: number) => {
        const newFriends = friends.filter((_, i) => i !== idx);
        setFriends(newFriends);
        Spicetify.LocalStorage.set("dedication:friends", JSON.stringify(newFriends));
    };

    const getDaysAgo = (timestamp?: number) => {
        if (!timestamp) return 'recently';
        const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        return `${days} days ago`;
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', color: 'var(--spice-text)' }}>
            <div style={{ display: 'flex', gap: '48px' }}>
                
                {/* Left Sidebar: Address Book */}
                <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ background: 'var(--spice-card)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--spice-button)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3 1.34-3 3 1.34 3 3 3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>My Identity</h2>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--spice-subtext)', marginBottom: '8px' }}>Your Friend Code:</div>
                        <div style={{ 
                            background: 'var(--spice-main)', padding: '16px', borderRadius: '12px', 
                            fontSize: '24px', fontWeight: '900', letterSpacing: '4px', textAlign: 'center', 
                            fontFamily: 'monospace', color: 'var(--spice-text)', border: '2px dashed rgba(255,255,255,0.1)' 
                        }}>
                            {friendCode}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button onClick={copyCode} style={{ flex: 1, padding: '12px', background: 'var(--spice-button)', color: 'var(--spice-button-text)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Copy Code
                            </button>
                            <button onClick={regenerateCode} style={{ padding: '12px', background: 'transparent', color: 'var(--spice-subtext)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }} title="Regenerate Code">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--spice-subtext)' }}>
                            Address Book
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input 
                                type="text" 
                                placeholder="Friend's Name" 
                                value={newFriendName}
                                onChange={e => setNewFriendName(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--spice-button-disabled)', background: 'transparent', color: 'var(--spice-text)' }}
                            />
                            <input 
                                type="text" 
                                placeholder="Code (e.g. ABCD-1234)" 
                                value={newFriendCode}
                                onChange={e => setNewFriendCode(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--spice-button-disabled)', background: 'transparent', color: 'var(--spice-text)' }}
                            />
                            <button 
                                onClick={addFriend}
                                disabled={!newFriendName || !newFriendCode}
                                style={{ 
                                    padding: '12px 24px', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer',
                                    background: (newFriendName && newFriendCode) ? 'var(--spice-button)' : 'var(--spice-button-disabled)',
                                    color: (newFriendName && newFriendCode) ? 'var(--spice-button-text)' : 'rgba(255,255,255,0.3)'
                                }}
                            >
                                Save Friend
                            </button>
                        </div>

                        {friends.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                {friends.map((friend, idx) => (
                                    <div key={idx} style={{ 
                                        background: 'var(--spice-card)', padding: '12px 16px', borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '16px' }}>{friend.name}</div>
                                            <div style={{ color: 'var(--spice-subtext)', fontSize: '12px', fontFamily: 'monospace', marginTop: '4px' }}>
                                                {friend.code}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => Spicetify.showNotification(`Right-click any track, select 'Send Dedication', then choose ${friend.name}!`, false, 4000)}
                                            style={{ background: 'var(--spice-button)', color: 'var(--spice-button-text)', border: 'none', padding: '6px 12px', borderRadius: '32px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                                        >
                                            Send
                                        </button>
                                        <button 
                                            onClick={() => removeFriend(idx)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--spice-subtext)', cursor: 'pointer', padding: '4px' }}
                                            title="Remove"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area: Inbox */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--spice-subtext)', marginBottom: '16px' }}>
                        Inbox
                    </div>

                    {inbox.length === 0 ? (
                        <div style={{ position: 'relative', padding: '40px 0' }}>
                            {/* Visual Teaser */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(5deg)',
                                width: '300px', height: '200px', background: 'var(--spice-card)',
                                borderRadius: '12px', opacity: 0.1, pointerEvents: 'none',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 0
                            }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--spice-text)', margin: '0 0 24px' }}>
                                    No songs dedicated to you yet. Drop your code on your story and see who thinks of you.
                                </h2>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '48px' }}>
                                    <div 
                                        onClick={copyCode}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--spice-subtext)"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
                                        <span style={{ fontSize: '14px', color: 'var(--spice-subtext)' }}>Share your code</span>
                                    </div>
                                    <div 
                                        onClick={() => Spicetify.showNotification("Right-click a track and select 'Send Dedication'!")}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--spice-subtext)"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zm-9-2h2v-2h-2v2zm0-4h2V7h-2v6z"/></svg>
                                        <span style={{ fontSize: '14px', color: 'var(--spice-subtext)' }}>Friends dedicate songs via right-click</span>
                                    </div>
                                    <div 
                                        onClick={() => showPostcardModal(
                                            { message: "This is a dummy postcard. Your real dedications will look like this!", fromName: "Dedication Team", trackUri: "", timestamp: Date.now() }, 
                                            { name: "Preview Song", artists: [{name: "Preview Artist"}] }
                                        )}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                    >
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--spice-subtext)"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/></svg>
                                        <span style={{ fontSize: '14px', color: 'var(--spice-subtext)' }}>Postcards appear here</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {inbox.map((msg, idx) => {
                                    const meta = tracksMeta[msg.trackUri];
                                    const coverUrl = meta?.album?.images?.[0]?.url;
                                    const trackName = meta?.name || (meta?.loading ? "Loading..." : "Unknown Track");
                                    const artistName = meta?.artists?.[0]?.name || "";
                                    const isRead = readState[msg.id];
                                    const isLong = msg.message.length > 80;

                                    return (
                                        <div key={idx} style={{
                                            background: 'var(--spice-card)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            display: 'flex',
                                            gap: '16px',
                                            alignItems: 'stretch',
                                            position: 'relative',
                                            boxShadow: isRead ? '0 2px 8px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.3)',
                                            border: isRead ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                                            transition: 'transform 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        onClick={() => {
                                            markAsRead(msg.id);
                                            showPostcardModal(msg, meta);
                                        }}>
                                            {/* Cover */}
                                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--spice-main)' }}>
                                                {coverUrl && <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            
                                            {/* Info */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--spice-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {trackName}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'var(--spice-subtext)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                                                    {artistName}
                                                </div>
                                                <div style={{
                                                    background: 'var(--spice-main)', padding: '10px 12px', borderRadius: '8px',
                                                    fontStyle: 'italic', fontSize: '13px', color: 'var(--spice-text)',
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                    "{msg.message}"
                                                </div>
                                                {isLong && (
                                                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--spice-button)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        View Details
                                                    </div>
                                                )}
                                            </div>

                                            {/* Meta & Status */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', flexShrink: 0, gap: '4px' }}>
                                                <div style={{ fontSize: '13px', color: 'var(--spice-subtext)' }}>
                                                    From <strong style={{color:'var(--spice-text)'}}>{msg.fromName}</strong>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--spice-subtext)' }}>
                                                    {new Date(msg.timestamp).toLocaleDateString()}
                                                </div>
                                                {!isRead && (
                                                    <div style={{ marginTop: 'auto', background: 'var(--spice-button)', color: 'var(--spice-button-text)', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                        New
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function render() {
    return <App />;
}
