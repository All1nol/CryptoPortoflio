import { updateAssetPrice } from '../features/portfolio/portfolioSlice';
import { Dispatch } from '@reduxjs/toolkit';

class WebSocketService {
  private socket: WebSocket | null = null;
  private dispatch: Dispatch | null = null;
  private assets: string[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClosure: boolean = false;

  init(dispatch: Dispatch, assets: string[]) {
    this.dispatch = dispatch;
    this.assets = assets;
    // Reset reconnection attempts when initializing
    this.reconnectAttempts = 0;
    this.isIntentionalClosure = false;
    this.connect();
  }

  connect() {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.isIntentionalClosure = true; // Mark this closure as intentional
      this.socket.close();
    }

    if (this.assets.length === 0) {
      return;
    }

    try {
      // Convert asset symbols to lowercase and add USDT suffix if needed
      const streams = this.assets.map(symbol => {
        const formattedSymbol = symbol.toLowerCase();
        return `${formattedSymbol}usdt@ticker`;
      });

      const endpoint = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
      
      this.isIntentionalClosure = false;
      this.socket = new WebSocket(endpoint);

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.data) {
            const ticker = data.data;

            // Extract the symbol without USDT suffix
            const symbol = ticker.s.replace('USDT', '');
            const price = parseFloat(ticker.c);
            const change24h = parseFloat(ticker.P);

            if (this.dispatch) {
              this.dispatch(updateAssetPrice({
                symbol,
                price,
                change24h,
              }));
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Error will trigger onclose, so we don't need to reconnect here
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        
        // Don't reconnect if it was intentionally closed or we've hit max attempts
        if (!this.isIntentionalClosure && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Maximum reconnection attempts reached. Please refresh the application.');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.reconnect();
    }
  }

  reconnect() {
    // Increment reconnect attempts
    this.reconnectAttempts++;
    
    // Calculate backoff time: 1s, 2s, 4s, 8s, etc. (exponential backoff)
    const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`Attempting to reconnect WebSocket... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${backoffTime}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, backoffTime);
  }

  updateAssets(assets: string[]) {
    this.assets = assets;
    this.isIntentionalClosure = true; // Mark as intentional when updating assets
    this.reconnectAttempts = 0; // Reset reconnect attempts
    this.connect();
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.isIntentionalClosure = true; // Mark this closure as intentional
      this.socket.close();
      this.socket = null;
    }
  }
}

export default new WebSocketService(); 