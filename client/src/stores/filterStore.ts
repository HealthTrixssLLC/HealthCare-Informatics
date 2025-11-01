import { create } from 'zustand';
import type { FilterDefinition, SourceDataset } from '@shared/schema';

interface FilterState {
  // Active filter values
  activeFilters: Record<string, any>;
  
  // Source dataset for filtering
  sourceData: SourceDataset | null;
  
  // Filter definitions from report
  filterDefinitions: FilterDefinition[];
  
  // Actions
  setSourceData: (data: SourceDataset | null) => void;
  setFilterDefinitions: (definitions: FilterDefinition[]) => void;
  updateFilter: (filterId: string, value: any) => void;
  clearFilter: (filterId: string) => void;
  clearAllFilters: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  activeFilters: {},
  sourceData: null,
  filterDefinitions: [],

  setSourceData: (data) => set({ sourceData: data }),
  
  setFilterDefinitions: (definitions) => {
    // Initialize active filters with default values
    const initialFilters: Record<string, any> = {};
    definitions.forEach(def => {
      if (def.defaultValue !== undefined) {
        initialFilters[def.id] = def.defaultValue;
      }
    });
    set({ 
      filterDefinitions: definitions,
      activeFilters: initialFilters
    });
  },

  updateFilter: (filterId, value) => {
    set(state => ({
      activeFilters: {
        ...state.activeFilters,
        [filterId]: value
      }
    }));
  },

  clearFilter: (filterId) => {
    set(state => {
      const newFilters = { ...state.activeFilters };
      delete newFilters[filterId];
      return { activeFilters: newFilters };
    });
  },

  clearAllFilters: () => set({ activeFilters: {} }),

  resetFilters: () => {
    const definitions = get().filterDefinitions;
    const initialFilters: Record<string, any> = {};
    definitions.forEach(def => {
      if (def.defaultValue !== undefined) {
        initialFilters[def.id] = def.defaultValue;
      }
    });
    set({ activeFilters: initialFilters });
  },
}));
