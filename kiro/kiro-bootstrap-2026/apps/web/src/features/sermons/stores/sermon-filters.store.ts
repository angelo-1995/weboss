import { create } from 'zustand';

interface SermonFiltersState {
  search: string;
  dateFrom: string;
  dateTo: string;
  setSearch: (search: string) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  clearFilters: () => void;
}

export const useSermonFiltersStore = create<SermonFiltersState>((set) => ({
  search: '',
  dateFrom: '',
  dateTo: '',
  setSearch: (search) => set({ search }),
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
  clearFilters: () => set({ search: '', dateFrom: '', dateTo: '' }),
}));
