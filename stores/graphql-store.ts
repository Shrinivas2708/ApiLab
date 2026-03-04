import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { INTROSPECTION_QUERY } from '@/components/graphql/utils';

export type KeyValue = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type GraphqlTab = {
  id: string;
  name: string;
  url: string;
  query: string;
  variables: string;
  headers: KeyValue[];
  auth: { type: 'none' | 'bearer' | 'basic'; token?: string; username?: string; password?: string };
  response: string | null;
  status: number | null;
  duration: number | null;
  loading: boolean;
  schema: any | null;
  isDirty: boolean;
  savedId?: string;
  collectionId?: string;
};

export type LocalCollection = {
  _id: string;
  name: string;
  requests: GraphqlTab[];
};

interface GraphqlState {
  tabs: GraphqlTab[];
  activeTabId: string | null;
  connectedEndpoint: string | null; 
  isConnecting: boolean;
  localCollections: LocalCollection[];
  activeRightSidebar: 'docs' | 'schema' | 'collections' | null;
  docHistory: any[];

  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateActiveTab: (data: Partial<GraphqlTab>) => void;
  updateTab: (id: string, data: Partial<GraphqlTab>) => void;
  reorderTabs: (activeId: string, overId: string) => void;
  
  connect: (url: string) => Promise<boolean>;
  disconnect: () => void;
  runQuery: () => Promise<void>;
  
  saveRequestToCollection: (req: GraphqlTab, collectionId: string, name: string) => void;
  createLocalCollection: (name: string) => void;
  
  setActiveRightSidebar: (view: 'docs' | 'schema' | 'collections' | null) => void;
  pushDocHistory: (item: any) => void;
  popDocHistory: () => void;
  resetDocHistory: () => void;
}

const createNewTab = (): GraphqlTab => ({
  id: crypto.randomUUID(),
  name: 'Untitled',
  url: "https://spacex-production.up.railway.app/",
  query: `query Example {\n  company {\n    ceo\n    cto\n  }\n}`,
  variables: "{}",
  headers: [{ id: crypto.randomUUID(), key: "Content-Type", value: "application/json", enabled: true }],
  auth: { type: 'none' },
  response: null,
  status: null,
  duration: null,
  loading: false,
  schema: null,
  isDirty: false
});

// FIX: Create initial tab outside store so we have a stable ID
const _initialTab = createNewTab();

export const useGraphqlStore = create<GraphqlState>()(
  persist(
    (set, get) => ({
      tabs: [_initialTab],
      activeTabId: _initialTab.id, // FIX: was null — now initialised to first tab's ID
      connectedEndpoint: null,
      isConnecting: false,
      localCollections: [],
      activeRightSidebar: 'collections',
      docHistory: [],

      addTab: () => {
        const newTab = createNewTab();
        set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: newTab.id }));
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
            tab.id === state.activeTabId ? { ...tab, ...data, isDirty: true } : tab
          ),
        }));
      },

      updateTab: (id, data) => set((state) => ({
          tabs: state.tabs.map((t) => t.id === id ? { ...t, ...data } : t)
      })),

      reorderTabs: (activeId, overId) => set((state) => {
          const oldIndex = state.tabs.findIndex((t) => t.id === activeId);
          const newIndex = state.tabs.findIndex((t) => t.id === overId);
          return { tabs: arrayMove(state.tabs, oldIndex, newIndex) };
      }),

      connect: async (url: string) => {
        const state = get();
        state.updateActiveTab({ loading: true });
        set({ isConnecting: true });

        try {
            const res = await fetch("/api/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    method: "POST",
                    url: url,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: INTROSPECTION_QUERY })
                })
            });
            
            const data = await res.json();
            const schemaData = data.data?.data?.__schema || data.data?.__schema;

            if (schemaData) {
                state.updateActiveTab({ schema: schemaData, loading: false });
                set({ connectedEndpoint: url, isConnecting: false });
                state.setActiveRightSidebar('docs');
                state.resetDocHistory();
                return true;
            } else {
                throw new Error("Invalid Schema");
            }
        } catch (e) {
            console.error(e);
            state.updateActiveTab({ loading: false });
            set({ isConnecting: false });
            return false;
        }
      },

      disconnect: () => {
          set({ connectedEndpoint: null });
          get().updateActiveTab({ schema: null });
      },

      runQuery: async () => {
        const state = get();
        const activeTab = state.tabs.find(t => t.id === state.activeTabId);
        if (!activeTab) return;

        state.updateActiveTab({ loading: true, response: null, status: null, duration: null });
        const startTime = performance.now();

        try {
            const headersObj = activeTab.headers.reduce((acc, h) => {
                if(h.enabled && h.key) acc[h.key] = h.value;
                return acc;
            }, {} as Record<string,string>);

            if(activeTab.auth.type === 'bearer' && activeTab.auth.token) {
                headersObj['Authorization'] = `Bearer ${activeTab.auth.token}`;
            }

            const res = await fetch("/api/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    method: "POST",
                    url: activeTab.url,
                    headers: headersObj,
                    body: JSON.stringify({
                        query: activeTab.query,
                        variables: activeTab.variables ? JSON.parse(activeTab.variables) : {}
                    })
                })
            });

            const data = await res.json();
            const duration = Math.round(performance.now() - startTime);
            const responseData = data.data || data; 

            state.updateActiveTab({
                response: typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2),
                status: data.status || res.status,
                duration: duration,
                loading: false
            });
        } catch (e: any) {
            state.updateActiveTab({
                response: JSON.stringify({ error: e.message }, null, 2),
                status: 0,
                duration: 0,
                loading: false
            });
        }
      },

      createLocalCollection: (name) => set((state) => ({
          localCollections: [...state.localCollections, { _id: crypto.randomUUID(), name, requests: [] }]
      })),

      saveRequestToCollection: (req, collectionId, name) => set((state) => {
          const updatedCol = state.localCollections.map(c => {
              if (c._id === collectionId) {
                  const exists = c.requests.find(r => r.id === req.id);
                  if (exists) {
                      return { ...c, requests: c.requests.map(r => r.id === req.id ? { ...req, name } : r) };
                  }
                  return { ...c, requests: [...c.requests, { ...req, name, savedId: req.id }] };
              }
              return c;
          });
          return { localCollections: updatedCol };
      }),

      setActiveRightSidebar: (view) => set({ activeRightSidebar: view }),
      pushDocHistory: (item) => set((state) => ({ docHistory: [...state.docHistory, item] })),
      popDocHistory: () => set((state) => ({ docHistory: state.docHistory.slice(0, -1) })),
      resetDocHistory: () => set({ docHistory: [] }),
    }),
    {
      name: 'apilab-graphql-store-v2',
      storage: createJSONStorage(() => localStorage),
      // FIX: ensure activeTabId is always valid after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.tabs || state.tabs.length === 0) {
            const fresh = createNewTab();
            state.tabs = [fresh];
            state.activeTabId = fresh.id;
          } else if (!state.activeTabId || !state.tabs.find((t: GraphqlTab) => t.id === state.activeTabId)) {
            state.activeTabId = state.tabs[0].id;
          }
        }
      }
    }
  )
);
