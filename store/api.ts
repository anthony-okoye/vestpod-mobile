import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${SUPABASE_URL}/functions/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      
      headers.set('apikey', SUPABASE_ANON_KEY);
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Portfolio', 'Asset', 'Alert', 'Insight', 'Profile'],
  endpoints: () => ({}),
});
