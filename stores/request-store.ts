
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KeyValue = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type RequestState = {
  url: string;
  method: string;
  queryParams: KeyValue[];
  headers: KeyValue[];
  body: string;
  response: any | null;
  loading: boolean;
  error: string | null;
  setUrl: (url: string) => void;
  setMethod: (method: string) => void;
  setQueryParams: (params: KeyValue[]) => void;
  setHeaders: (headers: KeyValue[]) => void;
  setBody: (body: string) => void;
  setResponse: (response: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useRequestStore = create<RequestState>()(
  persist(
    (set) => ({
      url: 'https://echo.hoppscotch.io',
      method: 'GET',
      queryParams: [{ id: '1', key: '', value: '', enabled: true }],
      headers: [{ id: '1', key: '', value: '', enabled: true }],
      body: '',
      response: null,
      loading: false,
      error: null,

      setUrl: (url) => set({ url }),
      setMethod: (method) => set({ method }),
      setQueryParams: (queryParams) => set({ queryParams }),
      setHeaders: (headers) => set({ headers }),
      setBody: (body) => set({ body }),
      setResponse: (response) => set({ response }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'apilab-request-store', 
    }
  )
);