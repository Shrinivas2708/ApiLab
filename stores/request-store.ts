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

export type AuthType = 
  | 'inherit' | 'none' | 'basic' | 'digest' | 'bearer' 
  | 'oauth2' | 'apikey' | 'aws' | 'hawk' | 'jwt';

export type AuthData = {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
  accessKey?: string;
  secretKey?: string;
  region?: string;
  service?: string;
  sessionToken?: string;
  hawkId?: string;
  hawkKey?: string;
  algorithm?: string;
};

export type Environment = {
    _id: string;
    name: string;
    variables: KeyValue[];
};

export type ApiRequestTab = {
  id: string;
  name: string;
  method: string;
  url: string;
  queryParams: KeyValue[];
  headers: KeyValue[];
  variables: KeyValue[]; // Request-local variables

  bodyType: 'none' | 'json' | 'xml' | 'text' | 'form-data' | 'x-www-form-urlencoded' | 'binary';
  body: string;
  bodyParams: KeyValue[];
  binaryFile: string | null;
  
  auth: AuthData;
  preRequestScript: string;
  postRequestScript: string;

  response: any | null;
  loading: boolean;
  error: string | null;
  reqMode: 'proxy' | 'browser';
  CORSError: boolean;

  isDirty: boolean;
  savedId?: string;      
  collectionId?: string; 
};

type RequestState = {
  tabs: ApiRequestTab[];
  activeTabId: string | null;
  
  // Environment State
  environments: Environment[];
  activeEnvId: string | null;
  globalVariables: KeyValue[]; // Simulated Global Vars for now

  // Actions
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (data: Partial<ApiRequestTab>) => void;
  updateTab: (id: string, data: Partial<ApiRequestTab>) => void;
  reorderTabs: (activeId: string, overId: string) => void;
  
  // Tab Setters
  setMethod: (method: string) => void;
  setUrl: (url: string) => void;
  setReqMode: (mode: 'proxy' | 'browser') => void;
  setQueryParams: (params: KeyValue[]) => void;
  setHeaders: (headers: KeyValue[]) => void;
  setVariables: (variables: KeyValue[]) => void;
  setBody: (body: string) => void;
  setBodyType: (type: ApiRequestTab['bodyType']) => void;
  setBodyParams: (params: KeyValue[]) => void;
  setBinaryFile: (base64: string | null) => void;
  setAuth: (auth: AuthData) => void;
  setPreRequestScript: (script: string) => void;
  setPostRequestScript: (script: string) => void;
  setResponse: (response: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCORSError: (error: boolean) => void;
  markAsSaved: (savedId: string, collectionId: string, name: string) => void;

  // Environment Actions
  setEnvironments: (envs: Environment[]) => void;
  setActiveEnvId: (id: string | null) => void;
  addEnvironment: (env: Environment) => void;
  updateEnvironment: (env: Environment) => void;
  deleteEnvironment: (id: string) => void;
  setGlobalVariables: (vars: KeyValue[]) => void;
};

const createNewTab = (): ApiRequestTab => ({
  id: crypto.randomUUID(),
  name: 'Untitled Request',
  method: 'GET',
  url: 'https://apilabs.shriii.xyz/api/echo',
  reqMode: 'browser',
  queryParams: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  headers: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  bodyType: 'none',
  body: '',
  bodyParams: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  binaryFile: null,
  auth: { type: 'none', addTo: 'header' },
  preRequestScript: "",
  postRequestScript: "",
  response: null,
  loading: false,
  error: null,
  CORSError: false,
  variables: [{ id: crypto.randomUUID(), key: '', value: '', description: '', enabled: true }],
  isDirty: false,
});

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      tabs: [createNewTab()],
      activeTabId: null,
      
      environments: [],
      activeEnvId: null,
      globalVariables: [{ id: 'g1', key: 'baseUrl', value: 'http://localhost:3000', enabled: true }],

      setEnvironments: (envs) => set({ environments: envs }),
      setActiveEnvId: (id) => set({ activeEnvId: id }),
      addEnvironment: (env) => set((state) => ({ environments: [...state.environments, env], activeEnvId: env._id })),
      updateEnvironment: (env) => set((state) => ({
        environments: state.environments.map(e => e._id === env._id ? env : e),
        ...(state.activeEnvId === env._id ? { /* trigger re-render if needed */ } : {})
      })),
      deleteEnvironment: (id) => set((state) => ({
        environments: state.environments.filter(e => e._id !== id),
        activeEnvId: state.activeEnvId === id ? null : state.activeEnvId
      })),
      setGlobalVariables: (vars) => set({ globalVariables: vars }),

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

      setMethod: (method) => get().updateActiveTab({ method, isDirty: true }),
      setUrl: (url) => get().updateActiveTab({ url, isDirty: true }),
      setReqMode: (reqMode) => get().updateActiveTab({ reqMode, isDirty: true }),
      setQueryParams: (queryParams) => get().updateActiveTab({ queryParams, isDirty: true }),
      setHeaders: (headers) => get().updateActiveTab({ headers, isDirty: true }),
      setVariables: (variables) => get().updateActiveTab({ variables, isDirty: true }),
      setBody: (body) => get().updateActiveTab({ body, isDirty: true }),
      setBodyParams: (bodyParams) => get().updateActiveTab({ bodyParams, isDirty: true }),
      setBinaryFile: (binaryFile) => get().updateActiveTab({ binaryFile, isDirty: true }),
      setAuth: (auth) => get().updateActiveTab({ auth, isDirty: true }),
      setPreRequestScript: (preRequestScript) => get().updateActiveTab({ preRequestScript, isDirty: true }),
      setPostRequestScript: (postRequestScript) => get().updateActiveTab({ postRequestScript, isDirty: true }),

      setBodyType: (bodyType) => {
        const state = get();
        const activeTab = state.tabs.find(t => t.id === state.activeTabId);
        if(!activeTab) return;

        let contentType = '';
        if (bodyType === 'json') contentType = 'application/json';
        else if (bodyType === 'xml') contentType = 'application/xml';
        else if (bodyType === 'text') contentType = 'text/plain';
        else if (bodyType === 'x-www-form-urlencoded') contentType = 'application/x-www-form-urlencoded';
        else if (bodyType === 'form-data') contentType = 'multipart/form-data'; 
        else if (bodyType === 'binary') contentType = 'application/octet-stream';

        const newHeaders = [...activeTab.headers];
        if (contentType) {
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
        get().updateActiveTab({ bodyType, headers: newHeaders, isDirty: true });
      },

      setResponse: (response) => get().updateActiveTab({ response }),
      setLoading: (loading) => get().updateActiveTab({ loading }),
      setError: (error) => get().updateActiveTab({ error }),
      setCORSError: (CORSError) => get().updateActiveTab({ CORSError }),

      markAsSaved: (savedId, collectionId, name) => {
        get().updateActiveTab({ savedId, collectionId, name, isDirty: false });
      }
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
        activeEnvId: state.activeEnvId,
        globalVariables: state.globalVariables,
        // We generally shouldn't persist environments here if we fetch them from DB, 
        // but for optimistic UI it's okay for now.
        environments: state.environments 
      }),
    }
  )
);
