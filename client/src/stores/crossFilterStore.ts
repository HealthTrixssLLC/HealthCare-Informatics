/**
 * Cross-filtering manager for Power BI-style interactive filtering
 * Allows clicking on any chart to filter all other visuals
 */
import { create } from 'zustand';

export interface CrossFilter {
  sourceChartId: string;
  filterField: string;
  filterValue: any;
  timestamp: number;
}

interface CrossFilterState {
  // Active cross-filters from chart interactions
  crossFilters: CrossFilter[];
  
  // Actions
  addCrossFilter: (filter: CrossFilter) => void;
  removeCrossFilter: (sourceChartId: string) => void;
  clearAllCrossFilters: () => void;
  getCombinedFilters: () => Record<string, any>;
}

export const useCrossFilterStore = create<CrossFilterState>((set, get) => ({
  crossFilters: [],

  addCrossFilter: (filter) => {
    set((state) => {
      // Remove existing filter from same source chart
      const filtered = state.crossFilters.filter(
        f => f.sourceChartId !== filter.sourceChartId
      );
      return { crossFilters: [...filtered, filter] };
    });
  },

  removeCrossFilter: (sourceChartId) => {
    set((state) => ({
      crossFilters: state.crossFilters.filter(
        f => f.sourceChartId !== sourceChartId
      )
    }));
  },

  clearAllCrossFilters: () => set({ crossFilters: [] }),

  getCombinedFilters: () => {
    const filters: Record<string, any> = {};
    const crossFilters = get().crossFilters;
    
    crossFilters.forEach(cf => {
      const field = cf.filterField;
      if (!filters[field]) {
        filters[field] = [];
      }
      
      // Combine as array for multiselect
      if (Array.isArray(filters[field])) {
        if (Array.isArray(cf.filterValue)) {
          filters[field] = [...filters[field], ...cf.filterValue];
        } else {
          filters[field].push(cf.filterValue);
        }
      }
    });
    
    return filters;
  },
}));
