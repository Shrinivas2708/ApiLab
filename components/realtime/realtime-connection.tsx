"use client";

import { useRealtimeStore } from "@/stores/realtime-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plug, Unplug } from "lucide-react";

export function RealtimeConnection() {
  const { activeProtocol, connections, updateConnection, connect, disconnect } = useRealtimeStore();
  const activeConnection = connections[activeProtocol];

  const handleConnect = () => {
    if (activeConnection.isConnected) {
      disconnect(activeProtocol);
    } else {
      connect(activeProtocol);
    }
  };

  return (
    <div className="flex flex-col h-full border-b bg-muted/5">
      <div className="p-3 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex gap-0 rounded-md border bg-background items-center overflow-hidden focus-within:ring-1 focus-within:ring-primary shadow-sm">
            <Input 
              value={activeConnection.url}
              onChange={(e) => updateConnection(activeProtocol, { url: e.target.value })}
              placeholder={
                activeProtocol === 'websocket' ? 'wss://example.com' :
                activeProtocol === 'sse' ? 'https://example.com/events' :
                activeProtocol === 'socketio' ? 'wss://example.com' :
                'wss://example.com:8081'
              }
              disabled={activeConnection.isConnected}
              className="flex-1 border-0 rounded-none focus-visible:ring-0 shadow-none h-9 font-mono text-sm"
            />
          </div>
          
          <Button 
            onClick={handleConnect}
            variant={activeConnection.isConnected ? "destructive" : "default"}
            size="sm"
            className="gap-2 min-w-[100px]"
          >
            {activeConnection.isConnected ? (
              <>
                <Unplug size={14} />
                Disconnect
              </>
            ) : (
              <>
                <Plug size={14} />
                Connect
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${activeConnection.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-muted-foreground">
            {activeConnection.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {activeConnection.isConnected && (
            <span className="text-muted-foreground ml-2">
              • {activeConnection.messages.filter(m => m.type === 'received').length} messages received
            </span>
          )}
        </div>
      </div>
    </div>
  );
}