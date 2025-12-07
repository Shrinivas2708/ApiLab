import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface GraphqlState {
  // Request
  url: string;
  query: string;
  variables: string;
  headers: Header[];
  auth: { type: 'none' | 'bearer' | 'basic'; token?: string; username?: string; password?: string };
  
  // Response
  response: string | null;
  status: number | null;
  duration: number | null;
  loading: boolean;

  // Schema & Docs
  schema: any | null;
  isConnected: boolean;
  docHistory: any[]; // For breadcrumbs
  
  // UI State
  activeRightSidebar: 'docs' | 'schema' | 'collections' | 'history' | null;

  // Actions
  setUrl: (url: string) => void;
  setQuery: (query: string) => void;
  setVariables: (vars: string) => void;
  setHeaders: (headers: Header[]) => void;
  setAuth: (auth: any) => void;
  setResponse: (data: any, status: number, duration: number) => void;
  setLoading: (loading: boolean) => void;
  setSchema: (schema: any) => void;
  setActiveRightSidebar: (view: 'docs' | 'schema' | 'collections' | 'history' | null) => void;
  pushDocHistory: (type: any) => void;
  popDocHistory: () => void;
  resetDocHistory: () => void;
}

export const useGraphqlStore = create<GraphqlState>()(
  persist(
    (set) => ({
      url: "https://spacex-production.up.railway.app/",
      query: `query Example {
  company {
    ceo
    cto
  }
}`,
      variables: "{}",
      headers: [{ id: '1', key: "Content-Type", value: "application/json", enabled: true }],
      auth: { type: 'none' },
      
      response: null,
      status: null,
      duration: null,
      loading: false,

      schema: null,
      isConnected: false,
      docHistory: [],
      
      activeRightSidebar: 'docs',

      setUrl: (url) => set({ url }),
      setQuery: (query) => set({ query }),
      setVariables: (variables) => set({ variables }),
      setHeaders: (headers) => set({ headers }),
      setAuth: (auth) => set({ auth }),
      setResponse: (response, status, duration) => set({ response, status, duration, loading: false }),
      setLoading: (loading) => set({ loading }),
      setSchema: (schema) => set({ schema, isConnected: true }),
      setActiveRightSidebar: (activeRightSidebar) => set({ activeRightSidebar }),
      
      pushDocHistory: (item) => set((state) => ({ docHistory: [...state.docHistory, item] })),
      popDocHistory: () => set((state) => ({ docHistory: state.docHistory.slice(0, -1) })),
      resetDocHistory: () => set({ docHistory: [] }),
    }),
    { name: 'apilab-graphql-store' }
  )
);