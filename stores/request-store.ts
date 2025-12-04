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
  reqMode: 'proxy' | 'browser'; 
  queryParams: KeyValue[];
  headers: KeyValue[];
  body: string;

  response: any | null;
  loading: boolean;
  error: string | null;
  CORSError:boolean;
  setUrl: (url: string) => void;
  setMethod: (method: string) => void;
  setReqMode: (mode: 'proxy' | 'browser') => void;
  setQueryParams: (params: KeyValue[]) => void;
  setHeaders: (headers: KeyValue[]) => void;
  setBody: (body: string) => void;
  setResponse: (response: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCORSError: (CORSError:boolean) => void;
};

export const useRequestStore = create<RequestState>()(
  persist(
    (set) => ({
      url: 'https://echo.hoppscotch.io',
      method: 'GET',
      reqMode: 'browser', // Default to proxy for reliability
      queryParams: [{ id: '1', key: '', value: '', enabled: true }],
      headers: [{ id: '1', key: '', value: '', enabled: true }],
      body: '',
      response: null,
      loading: false,
      error: null,
      CORSError:false,
      setUrl: (url) => set({ url }),
      setMethod: (method) => set({ method }),
      setReqMode: (reqMode) => set({ reqMode }), 
      setQueryParams: (queryParams) => set({ queryParams }),
      setHeaders: (headers) => set({ headers }),
      setBody: (body) => set({ body }),
      setResponse: (response) => set({ response }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setCORSError:(CORSError) => set({CORSError}),
    }),
    {
      name: 'apilab-request-store',
      partialize: (state) => ({
        url: state.url,
        method: state.method,
        reqMode: state.reqMode, 
        queryParams: state.queryParams,
        headers: state.headers,
        body: state.body,
      }),
    }
  )
);