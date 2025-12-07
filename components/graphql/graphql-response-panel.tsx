// components/graphql/graphql-response-panel.tsx
"use client";

import { useGraphqlStore } from "@/stores/graphql-store"; // New Store
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function GraphqlResponsePane() {
  const store = useGraphqlStore();
  const activeTab = store.tabs.find(t => t.id === store.activeTabId);

  if (!activeTab) return null;

  const { response, status, duration, loading } = activeTab;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin mb-2" />
        <p className="text-xs">Executing query...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 border-l border-border/50">
        <p className="text-xs">Response will appear here</p>
      </div>
    );
  }

 const statusColor = status! >= 200 && status! < 300 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
  
  return (
    <div className="flex flex-col h-full border-l border-border/50">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 h-10 min-h-10">
        <div className="flex gap-4 text-xs items-center">
          <Badge variant="outline" className={`${statusColor} border-0`}>
            {status} {status === 200 ? "OK" : "Error"}
          </Badge>
          <span className="text-muted-foreground">
            Time: <span className="text-foreground font-mono">{duration}ms</span>
          </span>
          <span className="text-muted-foreground">
            Size: <span className="text-foreground font-mono">{(response.length / 1024).toFixed(2)} KB</span>
          </span>
        </div>
      </div>
      <div className="flex-1 relative ">
        <CodeMirror
          value={response}
          height="100%"
          theme={monokai}
          extensions={[json()]}
          editable={false}
          className="h-full text-sm"
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
    </div>
  );
}