import { DedicationPayload } from '@dedication/transport';

// 5. Full Postcard Modal
function showPostcardModal(msg: any, meta: any, onDelete?: () => void) {
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
                <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '8px' }}>
                    <button 
                        onClick={() => {
                            Spicetify.PopupModal.hide();
                            onDelete?.();
                        }}
                        style={{
                            flex: 1,
                            background: 'transparent', color: 'var(--spice-error, #e22134)',
                            border: '1px solid var(--spice-error, #e22134)', padding: '14px 24px', borderRadius: '32px',
                            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        Delete
                    </button>
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
                                try { Spicetify.showNotification?.(String("Accepted & added to queue!")); } catch {}
                            } catch (e) {
                                Spicetify.Player.playUri(msg.trackUri);
                                try { Spicetify.showNotification?.(String("Playing now...")); } catch {}
                            }
                            Spicetify.PopupModal.hide();
                        }}
                        style={{
                            flex: 2,
                            background: 'var(--spice-button)', color: 'var(--spice-button-text)',
                            border: 'none', padding: '14px 24px', borderRadius: '32px',
                            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        Accept & Queue
                    </button>
                </div>
            </div>
        ) as any
    });
}

function App() {
    const [inbox, setInbox] = Spicetify.React.useState<any[]>([]);
    const [friendCode, setFriendCode] = Spicetify.React.useState(Spicetify.LocalStorage.get("dedication:friend_code") || "Unknown");
    const [readState, setReadState] = Spicetify.React.useState<Record<string, boolean>>({});
    
    // Address Book State
    const [friends, setFriends] = Spicetify.React.useState<{name: string, code: string, addedAt?: number}[]>([]);
    const [newFriendName, setNewFriendName] = Spicetify.React.useState("");
    const [newFriendCode, setNewFriendCode] = Spicetify.React.useState("");
    const [searchQuery, setSearchQuery] = Spicetify.React.useState("");
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

    // Fetch logic removed completely as per Zero Fetch policy

        const copyCode = () => {
        Spicetify.Platform.ClipboardAPI.copy(friendCode);
        try { Spicetify.showNotification?.(String("Friend code copied!")); } catch {}
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
            try { Spicetify.showNotification?.(String(`Regenerated! New Code: ${newCode}`)); } catch {}
            window.dispatchEvent(new CustomEvent('dedication:rebind_transport', { detail: newCode }));
        }
    };

    const markAsRead = (msgId: string) => {
        const newReadState = { ...readState, [msgId]: true };
        setReadState(newReadState);
        Spicetify.LocalStorage.set("dedication:read", JSON.stringify(newReadState));
    };

    const deleteDedication = (msgId: string) => {
        const newInbox = inbox.filter((m: any) => m.id !== msgId);
        setInbox(newInbox);
        Spicetify.LocalStorage.set("dedication:inbox", JSON.stringify(newInbox));
    };

    const addFriend = () => {
        if (!newFriendName || !newFriendCode) return;
        const code = newFriendCode.toUpperCase();
        
        // Validation: 8 chars, hyphen in middle, safe alphabet
        if (!/^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code)) {
            try { Spicetify.showNotification?.(String("Invalid code. Use format XXXX-XXXX (letters & numbers 2-9 only).")); } catch {}
            return;
        }

        // Duplicate Code check
        const existingCode = friends.find(f => f.code === code);
        if (existingCode) {
            try { Spicetify.showNotification?.(String(`Code already saved as ${existingCode.name}.`)); } catch {}
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
            try { Spicetify.showNotification?.(String(`Friend updated!`)); } catch {}
            return;
        }

        const newFriends = [...friends, { name: newFriendName, code, addedAt: Date.now() }];
        setFriends(newFriends);
        Spicetify.LocalStorage.set("dedication:friends", JSON.stringify(newFriends));
        setNewFriendName("");
        setNewFriendCode("");
        try { Spicetify.showNotification?.(String(`Friend ${newFriendName} saved!`)); } catch {}
    };

    const removeFriend = (code: string) => {
        const newFriends = friends.filter(f => f.code !== code);
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
                    <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--spice-subtext)' }}>
                        Your Code
                    </div>
                    
                    <div style={{ background: 'var(--spice-card)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ 
                                flex: 1, background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', 
                                fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.2em', textAlign: 'center', 
                                fontFamily: 'monospace', color: 'var(--spice-text)', border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {friendCode}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button onClick={copyCode} style={{ background: 'var(--spice-highlight-elevated)', color: 'var(--spice-text)', border: 'none', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--spice-highlight-elevated)'} title="Copy Code">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                                </button>
                                <button onClick={regenerateCode} style={{ background: 'transparent', color: 'var(--spice-subtext)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Regenerate Code">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                                </button>
                            </div>
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
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)' }}
                            />
                            <input 
                                type="text" 
                                placeholder="Code (e.g. ABCD-1234)" 
                                value={newFriendCode}
                                onChange={e => setNewFriendCode(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)', fontFamily: 'monospace' }}
                            />
                            <button 
                                onClick={addFriend}
                                disabled={!newFriendName || !newFriendCode}
                                style={{ 
                                    padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: (newFriendName && newFriendCode) ? 'pointer' : 'default',
                                    background: (newFriendName && newFriendCode) ? 'var(--spice-button)' : 'var(--spice-highlight-elevated)',
                                    color: (newFriendName && newFriendCode) ? 'var(--spice-button-text)' : 'var(--spice-subtext)',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                Save Friend
                            </button>
                        </div>

                        {friends.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                {friends.length >= 6 && (
                                    <input 
                                        type="text" 
                                        placeholder="Search friends..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'var(--spice-text)', boxSizing: 'border-box' }}
                                    />
                                )}
                                {friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.code.toLowerCase().includes(searchQuery.toLowerCase())).map((friend) => {
                                    const initial = friend.name.charAt(0).toUpperCase();
                                    return (
                                        <div key={friend.code} style={{ 
                                            background: 'var(--spice-card)', padding: '12px 16px', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--spice-highlight-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: 'var(--spice-text)', flexShrink: 0 }}>
                                                {initial}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{friend.name}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button 
                                                    onClick={() => {
                                                        window.dispatchEvent(new CustomEvent('dedication:quick_send', { detail: { friendCode: friend.code } }));
                                                    }}
                                                    style={{ background: 'var(--spice-button)', color: 'var(--spice-button-text)', border: 'none', padding: '6px 16px', borderRadius: '32px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                                                >
                                                    Send
                                                </button>
                                                <button 
                                                    onClick={() => removeFriend(friend.code)}
                                                    style={{ background: 'transparent', color: 'var(--spice-subtext)', border: 'none', padding: '4px', cursor: 'pointer', fontSize: '11px' }}
                                                    title="Remove friend"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content: Inbox */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--spice-subtext)' }}>
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
                                        onClick={() => {
                                            try { Spicetify.showNotification?.(String("Right-click a track and select 'Send Dedication'!")); } catch {}
                                        }}
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
                                    const coverUrl = msg.coverUrl;
                                    const trackName = msg.trackName || "Unknown Track";
                                    const artistName = msg.artistName || "Unknown Artist";
                                    const isRead = readState[msg.id];
                                    
                                    const senderName = msg.fromName && msg.fromName.toLowerCase() !== 'anonymous' ? msg.fromName : "Someone";
                                    const senderInitial = senderName.charAt(0).toUpperCase();

                                    return (
                                        <div key={idx} style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            display: 'flex',
                                            gap: '16px',
                                            alignItems: 'center',
                                            position: 'relative',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            transition: 'all 0.15s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            const btn = e.currentTarget.querySelector('.dedication-delete-btn') as HTMLElement;
                                            if (btn) btn.style.opacity = '1';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            const btn = e.currentTarget.querySelector('.dedication-delete-btn') as HTMLElement;
                                            if (btn) btn.style.opacity = '0';
                                        }}
                                        onClick={() => {
                                            markAsRead(msg.id);
                                            showPostcardModal(msg, { name: trackName, artists: [{name: artistName}], album: { images: [{url: coverUrl}] } }, () => deleteDedication(msg.id));
                                        }}>
                                            {/* Unread Dot */}
                                            {!isRead && (
                                                <div style={{ position: 'absolute', top: '24px', left: '16px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--spice-button)', zIndex: 3, transform: 'translate(-50%, -50%)', border: '2px solid var(--spice-main)' }} />
                                            )}

                                            {/* Cover with Fallback */}
                                            <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--spice-highlight-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--spice-subtext)', fontSize: '24px', fontWeight: 'bold', position: 'relative' }}>
                                                {coverUrl ? <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = trackName.charAt(0); }} /> : trackName.charAt(0)}
                                            </div>
                                            
                                            {/* Info */}
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center', gap: '2px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--spice-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {trackName}
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'var(--spice-subtext)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {artistName}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '13px', 
                                                    color: 'var(--spice-subtext)', 
                                                    marginTop: '2px',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {msg.message}
                                                </div>
                                            </div>

                                            {/* Meta & Status: Sender Identity */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, gap: '4px', minWidth: '64px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--spice-highlight-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--spice-text)', overflow: 'hidden' }}>
                                                    {msg.senderAvatar ? <img src={msg.senderAvatar} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : senderInitial}
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--spice-text)', textTransform: 'capitalize' }}>
                                                    {senderName}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--spice-subtext)', textTransform: 'capitalize' }}>
                                                    {getDaysAgo(msg.timestamp)}
                                                </div>
                                            </div>

                                            {/* Delete Button Container */}
                                            <div 
                                                className="dedication-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteDedication(msg.id);
                                                }}
                                                style={{
                                                    position: 'absolute', top: '-8px', right: '-8px', padding: '6px',
                                                    background: 'rgba(0,0,0,0.8)', borderRadius: '50%', color: 'var(--spice-subtext)',
                                                    cursor: 'pointer', zIndex: 4, display: 'flex', opacity: 0, transition: '0.15s ease',
                                                    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.borderColor = '#e74c3c'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--spice-subtext)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                                title="Delete"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
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
