import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';

export type KeyValue = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

// Definition of a single tab's data
export type ApiRequestTab = {
  id: string;
  name: string;
  method: string;
  url: string;
  queryParams: KeyValue[];
  headers: KeyValue[];
  body: string;
  response: any | null;
  loading: boolean;
  error: string | null;
  reqMode: 'proxy' | 'browser';
  CORSError: boolean;
};

// The Store State Interface
type RequestState = {
  tabs: ApiRequestTab[];
  activeTabId: string | null;
  
  // Actions
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (data: Partial<ApiRequestTab>) => void;
  updateTab: (id: string, data: Partial<ApiRequestTab>) => void; // <--- New Action
  reorderTabs: (activeId: string, overId: string) => void;
  
  // Helper Setters
  setMethod: (method: string) => void;
  setUrl: (url: string) => void;
  setReqMode: (mode: 'proxy' | 'browser') => void;
  setQueryParams: (params: KeyValue[]) => void;
  setHeaders: (headers: KeyValue[]) => void;
  setBody: (body: string) => void;
  setResponse: (response: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCORSError: (error: boolean) => void;
};

const createNewTab = (): ApiRequestTab => ({
  id: crypto.randomUUID(),
  name: 'Untitled Request',
  method: 'GET',
  url: 'https://echo.hoppscotch.io',
  reqMode: 'browser',
  queryParams: [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }],
  headers: [{ id: crypto.randomUUID(), key: '', value: '', enabled: true }],
  body: '',
  response: null,
  loading: false,
  error: null,
  CORSError: false,
});

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      tabs: [createNewTab()],
      activeTabId: null,

      addTab: () => {
        const newTab = createNewTab();
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: newTab.id,
        }));
      },

      closeTab: (id) => {
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;
          
          if (id === state.activeTabId) {
            newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }
          
          if (newTabs.length === 0) {
             const fresh = createNewTab();
             return { tabs: [fresh], activeTabId: fresh.id };
          }
          
          return { tabs: newTabs, activeTabId: newActiveId };
        });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      updateActiveTab: (data) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === state.activeTabId ? { ...tab, ...data } : tab
          ),
        }));
      },

      updateTab: (id, data) => { // <--- Implementation
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === id ? { ...tab, ...data } : tab
          ),
        }));
      },

      reorderTabs: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.tabs.findIndex((t) => t.id === activeId);
          const newIndex = state.tabs.findIndex((t) => t.id === overId);
          return { tabs: arrayMove(state.tabs, oldIndex, newIndex) };
        });
      },

      // --- Helper Wrappers ---
      setMethod: (method) => get().updateActiveTab({ method }),
      setUrl: (url) => get().updateActiveTab({ url }),
      setReqMode: (reqMode) => get().updateActiveTab({ reqMode }),
      setQueryParams: (queryParams) => get().updateActiveTab({ queryParams }),
      setHeaders: (headers) => get().updateActiveTab({ headers }),
      setBody: (body) => get().updateActiveTab({ body }),
      setResponse: (response) => get().updateActiveTab({ response }),
      setLoading: (loading) => get().updateActiveTab({ loading }),
      setError: (error) => get().updateActiveTab({ error }),
      setCORSError: (CORSError) => get().updateActiveTab({ CORSError }),
    }),
    {
      name: 'apilab-tabs-store',
      partialize: (state) => ({
        activeTabId: state.activeTabId,
        tabs: state.tabs.map((tab) => ({
          ...tab,
          response: null,
          loading: false,
          error: null,
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.tabs.length > 0 && !state.activeTabId) {
            state.activeTabId = state.tabs[0].id;
        }
      }
    }
  )
);