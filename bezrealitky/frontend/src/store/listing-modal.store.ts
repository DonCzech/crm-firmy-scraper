import { create } from 'zustand';

interface ListingModalState {
  slug: string | null;
  open: (slug: string) => void;
  close: () => void;
}

export const useListingModal = create<ListingModalState>((set) => ({
  slug: null,
  open: (slug) => set({ slug }),
  close: () => set({ slug: null }),
}));
