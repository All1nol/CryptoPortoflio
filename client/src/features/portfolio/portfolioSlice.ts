import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface Asset {
  id: string;
  name: string;
  symbol: string; //ticker
  quantity: number;
  currentPrice: number;
  previousPrice?: number;
  totalCost: number;
  change24h: number;
  percentageOfPortfolio: number;
}

interface PortfolioState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  totalPortfolioValue: number;
}

const calculatePercentages = (assets: Asset[]): Asset[] => {
  const totalValue = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
  
  return assets.map(asset => ({
    ...asset,
    percentageOfPortfolio: totalValue > 0 ? (asset.totalCost / totalValue) * 100 : 0,
  }));
};

const loadAssetsFromStorage = (): Asset[] => {
  try {
    const savedAssets = localStorage.getItem('portfolio');
    return savedAssets ? JSON.parse(savedAssets) : [];
  } catch (error) {
    console.error('Failed to load assets from localStorage:', error);
    return [];
  }
};

const saveAssetsToStorage = (assets: Asset[]) => {
  try {
    localStorage.setItem('portfolio', JSON.stringify(assets));
  } catch (error) {
    console.error('Failed to save assets to localStorage:', error);
  }
};

const initialState: PortfolioState = {
  assets: calculatePercentages(loadAssetsFromStorage()),
  loading: false,
  error: null,
  totalPortfolioValue: loadAssetsFromStorage().reduce((sum, asset) => sum + asset.totalCost, 0),
};

// Thunk for fetching initial price data
export const fetchInitialPrices = createAsyncThunk(
  'portfolio/fetchInitialPrices',
  async () => {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch price data');
    }
  }
);

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Omit<Asset, 'id' | 'percentageOfPortfolio'>>) => {
      const existingAssetId = state.assets.findIndex(asset => asset.symbol === action.payload.symbol);
      
      if (existingAssetId !== -1) {
        const existingAsset = state.assets[existingAssetId];
        const updatedAsset = {
          ...existingAsset,
          quantity: existingAsset.quantity + action.payload.quantity,
          totalCost: (existingAsset.quantity + action.payload.quantity) * action.payload.currentPrice,
        };
        
        state.assets[existingAssetId] = updatedAsset; // Update the existing asset
      } else {
        const newAsset = {
          ...action.payload,
          id: uuidv4(),
          totalCost: action.payload.quantity * action.payload.currentPrice,
          percentageOfPortfolio: 0,
        };
        
        state.assets.push(newAsset); 
      }
      
      state.assets = calculatePercentages(state.assets); // Recalculate percentages
      state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.totalCost, 0);
      
      saveAssetsToStorage(state.assets);
      console.log(state.assets);
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter(asset => asset.id !== action.payload);
      state.assets = calculatePercentages(state.assets);
      state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.totalCost, 0);
      
      saveAssetsToStorage(state.assets);
    },
    updateAssetPrice: (state, action: PayloadAction<{ symbol: string; price: number; change24h: number }>) => {
      const { symbol, price, change24h } = action.payload;
      
      const updatedAssets = state.assets.map(asset => {
        if (asset.symbol.toLowerCase() === symbol.toLowerCase()) {
          const previousPrice = asset.currentPrice;
          const newTotalCost = asset.quantity * price;
          
          return {
            ...asset,
            previousPrice,
            currentPrice: price,
            totalCost: newTotalCost,
            change24h,
          };
        }
        return asset;
      });
      
      state.assets = calculatePercentages(updatedAssets);
      state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.totalCost, 0);
      
      saveAssetsToStorage(state.assets);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInitialPrices.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update prices for existing assets
        const priceMap = new Map();
        action.payload.forEach((ticker: any) => {
          priceMap.set(ticker.symbol, {
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
          });
        });
        
        state.assets = state.assets.map(asset => {
          const priceData = priceMap.get(asset.symbol);
          if (priceData) {
            const newTotalCost = asset.quantity * priceData.price;
            return {
              ...asset,
              previousPrice: asset.currentPrice,
              currentPrice: priceData.price,
              totalCost: newTotalCost,
              change24h: priceData.change24h,
            };
          }
          return asset;
        });
        
        state.assets = calculatePercentages(state.assets);
        state.totalPortfolioValue = state.assets.reduce((sum, asset) => sum + asset.totalCost, 0);
      })
      .addCase(fetchInitialPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch price data';
      });
  },
});

export const { addAsset, removeAsset, updateAssetPrice } = portfolioSlice.actions;

export default portfolioSlice.reducer;



