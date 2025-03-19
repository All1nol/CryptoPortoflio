export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export interface AssetSearchResult {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  change24h: number;
}

export interface AssetFormData {
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  change24h: number;
}

export interface BinanceWebSocketData {
  stream: string;
  data: BinanceTickerData;
}

export interface BinanceTickerData {
  e: string;           // Event type
  E: number;           // Event time
  s: string;           // Symbol
  p: string;           // Price change
  P: string;           // Price change percent
  w: string;           // Weighted average price
  c: string;           // Last price
  Q: string;           // Last quantity
  o: string;           // Open price
  h: string;           // High price
  l: string;           // Low price
  v: string;           // Total traded base asset volume
  q: string;           // Total traded quote asset volume
  O: number;           // Statistics open time
  C: number;           // Statistics close time
  F: number;           // First trade ID
  L: number;           // Last trade ID
  n: number;           // Total number of trades
} 