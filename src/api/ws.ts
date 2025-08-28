type Listener = (payload: any) => void;
type ConnListener = (connected: boolean) => void;

type WsOptions = {
  url?: string; // ws(s)://...
  protocols?: string | string[];
  // Reconnect backoff
  minDelayMs?: number;
  maxDelayMs?: number;
};

class WSClient {
  private socket: WebSocket | null = null;
  private url: string;
  private protocols?: string | string[];
  private minDelay: number;
  private maxDelay: number;
  private connected = false;
  private shouldReconnect = true;
  private reconnectAttempts = 0;
  private queue: string[] = [];
  private topics = new Map<string, Set<Listener>>();
  private connListeners = new Set<ConnListener>();

  constructor({ url, protocols, minDelayMs = 1000, maxDelayMs = 15000 }: WsOptions = {}) {
    const defaultUrl = this.inferUrl();
    this.url = url || defaultUrl;
    this.protocols = protocols;
    this.minDelay = minDelayMs;
    this.maxDelay = maxDelayMs;
  }

  private inferUrl(): string {
    const env = (globalThis as any)?.process?.env;
    const apiBase = env?.EXPO_PUBLIC_API_BASE_URL || '';
    if (apiBase.startsWith('https://')) return apiBase.replace('https://', 'wss://') + '/ws';
    if (apiBase.startsWith('http://')) return apiBase.replace('http://', 'ws://') + '/ws';
    return 'ws://localhost:8080/ws';
  }

  private emitConn(val: boolean) {
    this.connListeners.forEach((fn) => {
      try {
        fn(val);
      } catch {
        // ignore
      }
    });
  }

  connect() {
    if (this.connected || this.socket) return;
    try {
      this.socket = this.protocols ? new WebSocket(this.url, this.protocols) : new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emitConn(true);
      // Flush queued messages
      for (const msg of this.queue) this.socket?.send(msg);
      this.queue = [];
    };

    this.socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data as any);
        const topic = data?.topic as string | undefined;
        const payload = data?.payload ?? data;
        if (topic && this.topics.has(topic)) {
          this.topics.get(topic)!.forEach((fn) => {
            try {
              fn(payload);
            } catch {
              // ignore listener error
            }
          });
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.socket.onclose = () => {
      this.connected = false;
      this.socket = null;
      this.emitConn(false);
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      // will trigger onclose; rely on reconnect
    };
  }

  private scheduleReconnect() {
    this.reconnectAttempts += 1;
    const backoff = Math.min(this.maxDelay, this.minDelay * 2 ** (this.reconnectAttempts - 1));
    setTimeout(() => this.connect(), backoff);
  }

  close() {
    this.shouldReconnect = false;
    try {
      this.socket?.close();
    } catch {
      // ignore
    }
    this.connected = false;
    this.socket = null;
    this.emitConn(false);
  }

  subscribe(topic: string, listener: Listener): () => void {
    if (!this.topics.has(topic)) this.topics.set(topic, new Set());
    this.topics.get(topic)!.add(listener);
    // Ensure connection
    this.connect();
    return () => {
      this.topics.get(topic)?.delete(listener);
      if (this.topics.get(topic)?.size === 0) {
        this.topics.delete(topic);
      }
    };
  }

  subscribeConnection(listener: ConnListener): () => void {
    this.connListeners.add(listener);
    // Emit current state immediately
    try {
      listener(this.connected);
    } catch {
      // ignore
    }
    // Ensure connection attempt if there are topic subscribers elsewhere
    this.connect();
    return () => {
      this.connListeners.delete(listener);
    };
  }

  isConnected() {
    return this.connected;
  }

  publish(topic: string, payload: any) {
    const msg = JSON.stringify({ topic, payload });
    if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      this.queue.push(msg);
    }
  }
}

let singleton: WSClient | null = null;

export function getWSClient(opts?: WsOptions) {
  if (!singleton) singleton = new WSClient(opts);
  return singleton;
}
