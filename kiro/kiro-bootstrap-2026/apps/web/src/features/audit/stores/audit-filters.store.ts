import { create } from 'zustand';

interface AuditFiltersState {
  action: string;
  resource: string;
  dateFrom: string;
  dateTo: string;
  userSearch: string;
  setAction: (action: string) => void;
  setResource: (resource: string) => void;
  setDateFrom: (dateFrom: string) => void;
  setDateTo: (dateTo: string) => void;
  setUserSearch: (userSearch: string) => void;
  clearFilters: () => void;
}

export const useAuditFiltersStore = create<AuditFiltersState>()((set) => ({
  action: '',
  resource: '',
  dateFrom: '',
  dateTo: '',
  userSearch: '',

  setAction: (action) => set({ action }),
  setResource: (resource) => set({ resource }),
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
  setUserSearch: (userSearch) => set({ userSearch }),

  clearFilters: () =>
    set({
      action: '',
      resource: '',
      dateFrom: '',
      dateTo: '',
      userSearch: '',
    }),
}));
