import { create } from 'zustand';

export type OfferType = 'SALE' | 'RENT';
export type EstateType = 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL' | 'GARAGE' | 'OTHER';
export type ViewMode = 'grid' | 'list' | 'map';

export interface SearchFilters {
  offerType?: OfferType;
  estateType?: EstateType;
  city?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  rooms?: string[];
  furnished?: boolean;
  parking?: boolean;
  balcony?: boolean;
  petFriendly?: boolean;
}

interface SearchState {
  filters: SearchFilters;
  page: number;
  sortField: string;
  sortDir: 'asc' | 'desc';
  viewMode: ViewMode;
  setFilters: (f: Partial<SearchFilters>) => void;
  setPage: (p: number) => void;
  setSort: (field: string, dir: 'asc' | 'desc') => void;
  setViewMode: (m: ViewMode) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: { offerType: 'RENT', estateType: 'APARTMENT' },
  page: 1,
  sortField: 'createdAt',
  sortDir: 'desc',
  viewMode: 'grid',

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f }, page: 1 })),
  setPage: (p) => set({ page: p }),
  setSort: (sortField, sortDir) => set({ sortField, sortDir, page: 1 }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () => set({ filters: { offerType: 'RENT', estateType: 'APARTMENT' }, page: 1 }),
}));
