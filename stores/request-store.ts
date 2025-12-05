import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';

export type KeyValue = {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
};

// Updated Auth Types to match the image
export type AuthType = 
  | 'inherit' 
  | 'none' 
  | 'basic' 
  | 'digest' 
  | 'bearer' 
  | 'oauth2' 
  | 'apikey' 
  | 'aws' 
  | 'hawk' 
  | 'jwt';

export type AuthData = {
  type: AuthType;
  
  // Basic / Digest / Hawk
  username?: string;
  password?: string;
  
  // Bearer / OAuth2 / JWT
  token?: string;
  
  // API Key
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
  
  // AWS Signature
  accessKey?: string;
  secretKey?: string;
  region?: string;
  service?: string;
  sessionToken?: string;

  // Hawk specific
  hawkId?: string;
  hawkKey?: string;
  algorithm?: string;
};

export type ApiRequestTab = {
  id: string;
  name: string;
  method: string;
  url: string;
  queryParams: KeyValue[];
  headers: KeyValue[];
  
  bodyType: 'none' | 'json' | 'xml' | 'text' | 'form-data' | 'x-www-form-urlencoded' | 'binary';
  body: string;
  bodyParams: KeyValue[];
  binaryFile: string | null;
  
  auth: AuthData;

  response: any | null;
  loading: boolean;
  error: string | null;
  reqMode: 'proxy' | 'browser';
  CORSError: boolean;
};

type RequestState = {
  tabs: ApiRequestTab[];
  activeTabId: string | null;
  
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (data: Partial<ApiRequestTab>) => void;
  updateTab: (id: string, data: Partial<ApiRequestTab>) => void;
  reorderTabs: (activeId: string, overId: string) => void;
  
  setMethod: (method: string) => void;
  setUrl: (url: string) => void;
  setReqMode: (mode: 'proxy' | 'browser') => void;
  setQueryParams: (params: KeyValue[]) => void;
  setHeaders: (headers: KeyValue[]) => void;
  
  // Body & Header Sync Logic
  setBody: (body: string) => void;
  setBodyType: (type: ApiRequestTab['bodyType']) => void;
  setBodyParams: (params: KeyValue[]) => void;
  setBinaryFile: (base64: string | null) => void;
  
  setAuth: (auth: AuthData) => void;
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
  queryParams: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  headers: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  bodyType: 'none',
  body: '',
  bodyParams: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  binaryFile: null,
  auth: { type: 'none', addTo: 'header' },
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

      updateTab: (id, data) => {
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

      setMethod: (method) => get().updateActiveTab({ method }),
      setUrl: (url) => get().updateActiveTab({ url }),
      setReqMode: (reqMode) => get().updateActiveTab({ reqMode }),
      setQueryParams: (queryParams) => get().updateActiveTab({ queryParams }),
      setHeaders: (headers) => get().updateActiveTab({ headers }),
      setBody: (body) => get().updateActiveTab({ body }),
      
      // AUTO-SYNC HEADER LOGIC
      setBodyType: (bodyType) => {
        const state = get();
        const activeTab = state.tabs.find(t => t.id === state.activeTabId);
        if(!activeTab) return;

        let contentType = '';
        if (bodyType === 'json') contentType = 'application/json';
        else if (bodyType === 'xml') contentType = 'application/xml';
        else if (bodyType === 'text') contentType = 'text/plain';
        else if (bodyType === 'x-www-form-urlencoded') contentType = 'application/x-www-form-urlencoded';
        else if (bodyType === 'form-data') contentType = 'multipart/form-data'; // Often auto-handled, but we set strictly for visibility
        else if (bodyType === 'binary') contentType = 'application/octet-stream';

        const newHeaders = [...activeTab.headers];
        
        // Remove existing Content-Type if switching to none
        if (bodyType === 'none') {
           // Optional: You might want to keep it if user added manually, 
           // but standard behavior is to clean up relevant headers
        } else if (contentType) {
           const existing = newHeaders.find(h => h.key.toLowerCase() === 'content-type');
           if (existing) {
             existing.value = contentType;
             existing.enabled = true;
           } else {
             newHeaders.unshift({ 
               id: crypto.randomUUID(), 
               key: 'Content-Type', 
               value: contentType, 
               description: 'Auto-generated', 
               enabled: false 
             });
           }
        }
        
        get().updateActiveTab({ bodyType, headers: newHeaders });
      },

      setBodyParams: (bodyParams) => get().updateActiveTab({ bodyParams }),
      setBinaryFile: (binaryFile) => get().updateActiveTab({ binaryFile }),
      setAuth: (auth) => get().updateActiveTab({ auth }),
      setResponse: (response) => get().updateActiveTab({ response }),
      setLoading: (loading) => get().updateActiveTab({ loading }),
      setError: (error) => get().updateActiveTab({ error }),
      setCORSError: (CORSError) => get().updateActiveTab({ CORSError }),
    }),
    {
      name: 'apilab-tabs-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTabId: state.activeTabId,
        tabs: state.tabs.map((tab) => ({
          ...tab,
          response: null,
          loading: false,
          error: null,
        })),
      }),
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Migrate old state to new structure
          const newTabs = persistedState.tabs.map((tab: any) => ({
            ...tab,
            auth: tab.auth || { type: 'none' },
            bodyType: tab.bodyType || 'none',
            body: tab.body || '',
            bodyParams: tab.bodyParams || [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
            queryParams: tab.queryParams?.map((q: any) => ({ ...q, description: q.description || '' })) || [],
            headers: tab.headers?.map((h: any) => ({ ...h, description: h.description || '' })) || [],
          }));
          return { ...persistedState, tabs: newTabs };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.tabs.length > 0 && !state.activeTabId) {
            state.activeTabId = state.tabs[0].id;
        }
      }
    }
  )
);
