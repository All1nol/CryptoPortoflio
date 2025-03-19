import axios from 'axios';
import { AssetSearchResult } from '../types';

// Popular cryptocurrencies for initial display
const POPULAR_CRYPTOS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 
  'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT'
];

class CryptoService {
  private allCoins: Record<string, any> = {};
  
  constructor() {
    // Pre-fetch all available coins when service is initialized
    this.fetchAllCoins();
  }
  
  private async fetchAllCoins() {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      
      // Only include USDT pairs for simplicity
      const usdtPairs = response.data.filter((ticker: any) => 
        ticker.symbol.endsWith('USDT') && 
        !ticker.symbol.includes('DOWNUSDT') && 
        !ticker.symbol.includes('UPUSDT')
      );
      
      // Create a map of all coins
      usdtPairs.forEach((ticker: any) => {
        const symbol = ticker.symbol.replace('USDT', '');
        this.allCoins[symbol] = {
          symbol,
          lastPrice: parseFloat(ticker.lastPrice),
          priceChangePercent: parseFloat(ticker.priceChangePercent)
        };
      });
      
      console.log(`Loaded ${Object.keys(this.allCoins).length} cryptocurrencies from Binance`);
    } catch (error) {
      console.error('Error fetching all coins:', error);
    }
  }

  async getAssetDetails(symbol: string): Promise<AssetSearchResult | null> {
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
      const data = response.data;
      
      if (!data) return null;
      
      return {
        id: symbol.toLowerCase(),
        name: this.getFullNameFromSymbol(symbol),
        symbol: symbol,
        currentPrice: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent)
      };
    } catch (error) {
      console.error('Error fetching asset details:', error);
      return null;
    }
  }

  // Helper to get the full name of a cryptocurrency (where available)
  private getFullNameFromSymbol(symbol: string): string {
    const nameMap: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'XRP': 'XRP',
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'DOT': 'Polkadot',
      'DOGE': 'Dogecoin',
      'AVAX': 'Avalanche',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin',
      'MATIC': 'Polygon',
      'XLM': 'Stellar',
      'TRX': 'TRON',
      'ATOM': 'Cosmos',
      // Add more mappings as needed
    };
    
    return nameMap[symbol] || `${symbol} Token`;
  }

  async searchAssets(query: string): Promise<AssetSearchResult[]> {
    try {
      // If we don't have any coins loaded yet, wait for them
      if (Object.keys(this.allCoins).length === 0) {
        await this.fetchAllCoins();
      }
      
      const trimmedQuery = query.trim().toLowerCase();
      
      // If empty query, return popular cryptos
      if (trimmedQuery === '') {
        return this.getPopularAssets();
      }
      
      // First, try to find exact ticker matches (highest priority)
      const exactMatches = Object.keys(this.allCoins).filter(symbol => 
        symbol.toLowerCase() === trimmedQuery
      );
      
      // Then look for symbols that start with the query (second priority)
      const startWithMatches = Object.keys(this.allCoins).filter(symbol => 
        symbol.toLowerCase().startsWith(trimmedQuery) && 
        !exactMatches.includes(symbol)
      );
      
      // Then look for partial symbol matches or name matches (third priority)
      const partialMatches = Object.keys(this.allCoins).filter(symbol => 
        (symbol.toLowerCase().includes(trimmedQuery) || 
        this.getFullNameFromSymbol(symbol).toLowerCase().includes(trimmedQuery)) && 
        !exactMatches.includes(symbol) && 
        !startWithMatches.includes(symbol)
      );
      
      // Combine results in priority order
      const combinedResults = [...exactMatches, ...startWithMatches, ...partialMatches];
      
      // If no results, return popular cryptos
      if (combinedResults.length === 0) {
        return this.getPopularAssets();
      }
      
      // Limit to 20 results for performance
      const limitedSymbols = combinedResults.slice(0, 20);
      
      // Map to asset search results
      const results = limitedSymbols.map(symbol => {
        const coin = this.allCoins[symbol];
        return {
          id: symbol.toLowerCase(),
          name: this.getFullNameFromSymbol(symbol),
          symbol: symbol,
          currentPrice: coin.lastPrice,
          change24h: coin.priceChangePercent
        };
      });
      
      return results;
    } catch (error) {
      console.error('Error searching assets:', error);
      return [];
    }
  }

  async getPopularAssets(): Promise<AssetSearchResult[]> {
    try {
      // If we don't have any coins loaded yet, wait for them
      if (Object.keys(this.allCoins).length === 0) {
        await this.fetchAllCoins();
      }
      
      const results = await Promise.all(
        POPULAR_CRYPTOS.map(async symbolWithUsdt => {
          try {
            const symbol = symbolWithUsdt.replace('USDT', '');
            const coin = this.allCoins[symbol];
            
            if (!coin) {
              // Fallback to API if not in cache
              const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbolWithUsdt}`);
              return {
                id: symbol.toLowerCase(),
                name: this.getFullNameFromSymbol(symbol),
                symbol: symbol,
                currentPrice: parseFloat(response.data.lastPrice),
                change24h: parseFloat(response.data.priceChangePercent)
              };
            }
            
            return {
              id: symbol.toLowerCase(),
              name: this.getFullNameFromSymbol(symbol),
              symbol: symbol,
              currentPrice: coin.lastPrice,
              change24h: coin.priceChangePercent
            };
          } catch (error) {
            console.error(`Error fetching data for ${symbolWithUsdt}:`, error);
            return null;
          }
        })
      );
      
      return results.filter(result => result !== null) as AssetSearchResult[];
    } catch (error) {
      console.error('Error fetching popular assets:', error);
      return [];
    }
  }
  
  // Get all available cryptocurrencies
  async getAllCryptocurrencies(): Promise<AssetSearchResult[]> {
    try {
      // If we don't have any coins loaded yet, wait for them
      if (Object.keys(this.allCoins).length === 0) {
        await this.fetchAllCoins();
      }
      
      // Limit to first 100 coins for performance
      const symbols = Object.keys(this.allCoins).slice(0, 100);
      
      return symbols.map(symbol => {
        const coin = this.allCoins[symbol];
        return {
          id: symbol.toLowerCase(),
          name: this.getFullNameFromSymbol(symbol),
          symbol: symbol,
          currentPrice: coin.lastPrice,
          change24h: coin.priceChangePercent
        };
      });
    } catch (error) {
      console.error('Error fetching all cryptocurrencies:', error);
      return [];
    }
  }
}

export default new CryptoService(); 