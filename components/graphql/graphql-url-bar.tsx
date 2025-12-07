"use client";

import { useGraphqlStore } from "@/stores/graphql-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Zap, Save, Globe, Server, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { SaveGraphqlDialog } from "./save-graphql-dialog"; // We will create this
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function GraphqlUrlBar() {
  const store = useGraphqlStore();
  const activeTab = store.tabs.find(t => t.id === store.activeTabId);
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);

  if (!activeTab) return null;

  const isConnectedToCurrent = store.connectedEndpoint === activeTab.url;

  const handleConnectClick = () => {
    if (store.connectedEndpoint && !isConnectedToCurrent) {
        // Warn before switching
        setWarnDialogOpen(true);
    } else if (isConnectedToCurrent) {
        // Already connected, so Disconnect
        store.disconnect();
    } else {
        // Connect
        store.connect(activeTab.url);
    }
  };

  const confirmSwitchConnection = () => {
      store.disconnect();
      store.connect(activeTab.url);
      setWarnDialogOpen(false);
  };

  return (
    <>
    <div className="flex items-center gap-2 p-2 border-b bg-muted/10 shrink-0">
      <div className="flex-1 flex gap-0 rounded-md border bg-background items-center overflow-hidden focus-within:ring-1 focus-within:ring-primary shadow-sm">
        <div className="bg-muted px-3 py-1.5 border-r text-xs font-bold text-muted-foreground select-none">
            POST
        </div>
        <Input 
            value={activeTab.url}
            onChange={(e) => store.updateActiveTab({ url: e.target.value })}
            placeholder="https://api.example.com/graphql"
            className="flex-1 border-0 rounded-none focus-visible:ring-0 shadow-none h-9 font-mono text-sm"
        />
      </div>
      
     

      <Button 
        variant={isConnectedToCurrent ? "default" : "secondary"} 
        onClick={handleConnectClick} 
        disabled={activeTab.loading && !activeTab.schema}
        className={`gap-2 min-w-[100px] ${isConnectedToCurrent ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
        size="sm"
      >
        <Zap size={14} className={isConnectedToCurrent ? "fill-current" : ""} />
        {activeTab.loading && !activeTab.response ? "..." : isConnectedToCurrent ? "Disconnect" : "Connect"}
      </Button>

      <Button onClick={store.runQuery} disabled={activeTab.loading} size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm">
        <Play size={14} className={activeTab.loading ? "animate-spin" : "fill-current"} /> 
        Run
      </Button>

      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setSaveDialogOpen(true)}>
        <Save size={16} />
      </Button>
    </div>

    {/* Switch Connection Warning Dialog */}
    <Dialog open={warnDialogOpen} onOpenChange={setWarnDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    Switch connection
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4 text-sm text-muted-foreground">
                <p>
                    You&apos;re connected to a GraphQL endpoint. The connection URL is:<br/>
                    <code className="bg-muted px-1 py-0.5 rounded text-foreground">{store.connectedEndpoint}</code>
                </p>
                <p>
                    Switching to this tab will disconnect you from the active GraphQL connection. New connection URL is:<br/>
                    <code className="bg-muted px-1 py-0.5 rounded text-foreground">{activeTab.url}</code>
                </p>
                <p className="font-medium text-foreground">
                    Do you want to connect with the latest GraphQL endpoint?
                </p>
            </div>
            <DialogFooter className="gap-2 sm:justify-start">
                <Button variant="default" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={confirmSwitchConnection}>
                    Connect
                </Button>
                <Button variant="secondary" onClick={() => setWarnDialogOpen(false)}>
                    Cancel
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <SaveGraphqlDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen} />
    </>
  );
}