import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AssetType = 'stock' | 'crypto' | 'commodity' | 'real_estate' | 'fixed_income' | 'other';

interface Asset {
  id: string;
  portfolio_id: string;
  asset_type: AssetType;
  symbol?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AssetsState {
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: AssetsState = {
  assets: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.assets.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const index = state.assets.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.assets[index] = action.payload;
        state.lastUpdated = new Date().toISOString();
      }
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter(a => a.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    updateAssetPrice: (
      state,
      action: PayloadAction<{ id: string; price: number }>
    ) => {
      const asset = state.assets.find(a => a.id === action.payload.id);
      if (asset) {
        asset.current_price = action.payload.price;
        state.lastUpdated = new Date().toISOString();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setAssets,
  addAsset,
  updateAsset,
  removeAsset,
  updateAssetPrice,
  setLoading,
  setError,
} = assetsSlice.actions;

export default assetsSlice.reducer;
