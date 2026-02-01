import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Portfolio {
  id: string;
  name: string;
  user_id: string;
  total_value: number;
  created_at: string;
  updated_at: string;
}

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolioId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolios: [],
  selectedPortfolioId: null,
  isLoading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolios: (state, action: PayloadAction<Portfolio[]>) => {
      state.portfolios = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.portfolios.push(action.payload);
    },
    updatePortfolio: (state, action: PayloadAction<Portfolio>) => {
      const index = state.portfolios.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.portfolios[index] = action.payload;
      }
    },
    removePortfolio: (state, action: PayloadAction<string>) => {
      state.portfolios = state.portfolios.filter(p => p.id !== action.payload);
      if (state.selectedPortfolioId === action.payload) {
        state.selectedPortfolioId = state.portfolios[0]?.id || null;
      }
    },
    selectPortfolio: (state, action: PayloadAction<string>) => {
      state.selectedPortfolioId = action.payload;
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
  setPortfolios,
  addPortfolio,
  updatePortfolio,
  removePortfolio,
  selectPortfolio,
  setLoading,
  setError,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
