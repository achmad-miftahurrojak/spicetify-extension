export interface DedicationPayload {
    fromName: string;
    trackUri: string;
    message: string;
    timestamp: number;
    trackName?: string;
    artistName?: string;
    coverUrl?: string;
}

export interface DedicationMessage extends DedicationPayload {
    id: string;
}

export interface TransportConfig {
    databaseUrl: string;
}

export class FirebaseTransport {
    private dbUrl: string;
    private sseController: AbortController | null = null;
    private pollingInterval: NodeJS.Timeout | null = null;
    private lastDisconnectTime: number = 0;
    
    constructor(config: TransportConfig) {
        this.dbUrl = config.databaseUrl.endsWith('/') 
            ? config.databaseUrl.slice(0, -1) 
            : config.databaseUrl;
    }

    async sendDedication(targetCode: string, payload: DedicationPayload): Promise<boolean> {
        try {
            const url = `${this.dbUrl}/dedications/${targetCode}.json`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return response.ok;
        } catch (e) {
            console.error('[Transport] Failed to send dedication', e);
            return false;
        }
    }

    async deleteDedication(friendCode: string, messageId: string): Promise<boolean> {
        try {
            const url = `${this.dbUrl}/dedications/${friendCode}/${messageId}.json`;
            const response = await fetch(url, { method: 'DELETE' });
            return response.ok;
        } catch (e) {
            console.error('[Transport] Failed to delete dedication', e);
            return false;
        }
    }

    private async performLazyCleanup(friendCode: string, dedications: Record<string, DedicationPayload>) {
        const now = Date.now();
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        
        for (const [id, msg] of Object.entries(dedications)) {
            if (msg.timestamp && (now - msg.timestamp) > THIRTY_DAYS) {
                await this.deleteDedication(friendCode, id);
            }
        }
    }

    listen(friendCode: string, onNewMessage: (msg: DedicationMessage) => void) {
        this.startSSE(friendCode, onNewMessage);
    }

    stop() {
        if (this.sseController) {
            this.sseController.abort();
            this.sseController = null;
        }
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    private startSSE(friendCode: string, onNewMessage: (msg: DedicationMessage) => void) {
        this.stop();
        this.sseController = new AbortController();
        
        const url = `${this.dbUrl}/dedications/${friendCode}.json`;
        
        fetch(url, {
            headers: { 'Accept': 'text/event-stream' },
            signal: this.sseController.signal
        }).then(async (response) => {
            if (!response.body) throw new Error("No readable stream");
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                let eventType = 'message';
                for (let line of lines) {
                    if (line.startsWith('event: ')) {
                        eventType = line.slice(7).trim();
                    } else if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === 'null') continue;
                        
                        try {
                            const data = JSON.parse(dataStr);
                            this.handleSSEEvent(friendCode, eventType, data, onNewMessage);
                        } catch (e) {
                            console.error("[Transport] Failed to parse SSE data", e);
                        }
                    }
                }
            }
        }).catch(err => {
            if (err.name === 'AbortError') return;
            
            console.error("[Transport] SSE Disconnected, entering fallback mode.", err);
            this.lastDisconnectTime = Date.now();
            this.startPolling(friendCode, onNewMessage);
        });
    }

    private handleSSEEvent(friendCode: string, eventType: string, data: any, onNewMessage: (msg: DedicationMessage) => void) {
        if (eventType === 'put' || eventType === 'patch') {
            const path = data.path;
            const payload = data.data;
            
            if (!payload) return;
            
            if (path === '/') {
                this.performLazyCleanup(friendCode, payload);
                for (const [id, msg] of Object.entries(payload)) {
                    onNewMessage({ id, ...(msg as DedicationPayload) });
                }
            } else {
                const id = path.slice(1);
                if (payload.timestamp) {
                    onNewMessage({ id, ...(payload as DedicationPayload) });
                }
            }
        }
    }

    private startPolling(friendCode: string, onNewMessage: (msg: DedicationMessage) => void) {
        if (this.pollingInterval) return;
        
        const poll = async () => {
            const timeSinceDisconnect = Date.now() - this.lastDisconnectTime;
            
            if (timeSinceDisconnect < 5 * 60 * 1000) {
                this.stop();
                this.startSSE(friendCode, onNewMessage);
                return;
            }

            try {
                const url = `${this.dbUrl}/dedications/${friendCode}.json`;
                const response = await fetch(url);
                const payload = await response.json();
                
                if (payload) {
                    this.performLazyCleanup(friendCode, payload);
                    for (const [id, msg] of Object.entries(payload)) {
                        onNewMessage({ id, ...(msg as DedicationPayload) });
                    }
                }
            } catch (e) {
                console.error("[Transport] Polling failed", e);
            }
        };

        this.pollingInterval = setInterval(poll, 30000);
    }
}
