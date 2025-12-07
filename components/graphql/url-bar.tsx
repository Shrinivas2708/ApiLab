"use client";

import { useGraphqlStore } from "./store";
import { INTROSPECTION_QUERY } from "./utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Zap, Save } from "lucide-react";
import { useState } from "react";
import { SaveRequestDialog } from "@/components/save-request-dialog"; // Reusing your existing dialog if compatible, or creating new

export function GraphqlUrlBar() {
  const store = useGraphqlStore();
  const [connecting, setConnecting] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch(store.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: INTROSPECTION_QUERY })
      });
      const data = await res.json();
      if (data.data?.__schema) {
        store.setSchema(data.data.__schema);
        store.setActiveRightSidebar('docs');
      } else {
        alert("Failed to fetch schema");
      }
    } catch (e) {
      console.error(e);
      alert("Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleRun = async () => {
    store.setLoading(true);
    const startTime = performance.now();
    try {
      const headers = store.headers.reduce((acc, h) => {
        if(h.enabled && h.key) acc[h.key] = h.value;
        return acc;
      }, {} as Record<string,string>);

      // Add Auth
      if(store.auth.type === 'bearer' && store.auth.token) {
        headers['Authorization'] = `Bearer ${store.auth.token}`;
      } else if (store.auth.type === 'basic') {
        headers['Authorization'] = `Basic ${btoa(`${store.auth.username}:${store.auth.password}`)}`;
      }

      const res = await fetch(store.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: store.query,
          variables: store.variables ? JSON.parse(store.variables) : {}
        })
      });
      
      const data = await res.json();
      const duration = Math.round(performance.now() - startTime);
      
      store.setResponse(JSON.stringify(data, null, 2), res.status, duration);
    } catch (e: any) {
        store.setResponse(JSON.stringify({ error: e.message }, null, 2), 0, 0);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/10">
      <div className="flex-1 flex gap-0 rounded-md border bg-background items-center overflow-hidden focus-within:ring-1 focus-within:ring-primary">
        <Input 
            value={store.url}
            onChange={(e) => store.setUrl(e.target.value)}
            placeholder="https://api.example.com/graphql"
            className="flex-1 border-0 rounded-none focus-visible:ring-0 shadow-none h-9"
        />
      </div>
      
      <Button 
        variant={store.isConnected ? "default" : "secondary"} 
        onClick={handleConnect} 
        disabled={connecting}
        className="gap-2 min-w-[100px]"
      >
        <Zap size={14} className={store.isConnected ? "fill-current" : ""} />
        {connecting ? "..." : store.isConnected ? "Connected" : "Connect"}
      </Button>

      <Button onClick={handleRun} disabled={store.loading} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
        <Play size={14} /> Run
      </Button>

      <Button variant="outline" size="icon" onClick={() => setSaveDialogOpen(true)}>
        <Save size={16} />
      </Button>

    </div>
  );
}