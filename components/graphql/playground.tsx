"use client";

import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Play, Book, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraphqlRequestPane } from "./request-pane";
import { GraphqlResponsePane } from "./response-pane";
import { GraphqlDocsPane } from "./docs-pane";

// Basic Introspection Query
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        description
      }
      queryType { name }
      mutationType { name }
      subscriptionType { name }
    }
  }
`;

export default function GraphqlPlayground() {
  const [url, setUrl] = useState("https://spacex-production.up.railway.app/");
  const [query, setQuery] = useState(`query Example {
  company {
    ceo
    cto
  }
}`);
  const [variables, setVariables] = useState(`{}`);
  const [headers, setHeaders] = useState([{ id: '1', key: "Content-Type", value: "application/json", enabled: true }]);
  
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [schema, setSchema] = useState<any>(null);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    const startTime = performance.now();

    try {
      const reqHeaders: Record<string, string> = {};
      headers.forEach(h => { if(h.enabled && h.key) reqHeaders[h.key] = h.value });

      const res = await fetch(url, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify({
          query,
          variables: variables ? JSON.parse(variables) : {}
        })
      });

      const data = await res.json();
      const endTime = performance.now();
      
      setStatus(res.status);
      setDuration(Math.round(endTime - startTime));
      setResponse(JSON.stringify(data, null, 2));

      if (!schema && res.ok) fetchSchema();

    } catch (error: any) {
      setStatus(0);
      setResponse(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: INTROSPECTION_QUERY })
      });
      const data = await res.json();
      if (data.data?.__schema) {
        setSchema(data.data.__schema);
      }
    } catch (e) {
      console.error("Failed to fetch schema", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Top Bar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <div className="flex-1 flex gap-2">
            <div className="flex items-center justify-center bg-muted px-3 rounded text-xs font-bold text-primary border">
                POST
            </div>
            <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter GraphQL URL"
                className="flex-1 font-mono text-sm"
            />
        </div>
        <Button onClick={handleRun} disabled={loading} className="gap-2">
            <Play size={16} className={loading ? "animate-pulse" : "fill-current"} />
            {loading ? "Running" : "Run"}
        </Button>
        <Button variant={isDocsOpen ? "secondary" : "ghost"} size="icon" onClick={() => setIsDocsOpen(!isDocsOpen)} title="Toggle Docs">
            <Book size={18} />
        </Button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
            {/* Left Side (Request & Response) */}
            <Panel defaultSize={75} minSize={50}>
                <PanelGroup direction="vertical">
                    {/* Request Pane */}
                    <Panel defaultSize={50} minSize={30} className="flex flex-col">
                        <GraphqlRequestPane 
                            query={query} setQuery={setQuery}
                            variables={variables} setVariables={setVariables}
                            headers={headers} setHeaders={setHeaders}
                        />
                    </Panel>
                    
                    <PanelResizeHandle className="h-px bg-border hover:bg-primary/50 transition-colors" />
                    
                    {/* Response Pane */}
                    <Panel defaultSize={50} minSize={20}>
                        <GraphqlResponsePane  />
                    </Panel>
                </PanelGroup>
            </Panel>

            {/* Right Side (Documentation) */}
            {isDocsOpen && (
                <>
                    <PanelResizeHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />
                    <Panel defaultSize={25} minSize={20} maxSize={40}>
                        <GraphqlDocsPane schema={schema} onFetch={fetchSchema} />
                    </Panel>
                </>
            )}
        </PanelGroup>
      </div>
    </div>
  );
}