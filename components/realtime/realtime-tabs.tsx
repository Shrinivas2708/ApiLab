"use client";

import { useRealtimeStore, Protocol } from "@/stores/realtime-store";
import { cn } from "@/lib/utils";

const protocolConfig = {
  websocket: {
    label: "WebSocket",
    shortLabel: "WS",
    color: "text-blue-500",
    bgActive: "bg-blue-500/10 border-b-blue-500",
  },
  sse: {
    label: "Server-Sent Events",
    shortLabel: "SSE",
    color: "text-green-500",
    bgActive: "bg-green-500/10 border-b-green-500",
  },
  socketio: {
    label: "Socket.IO",
    shortLabel: "IO",
    color: "text-purple-500",
    bgActive: "bg-purple-500/10 border-b-purple-500",
  },
  mqtt: {
    label: "MQTT",
    shortLabel: "MQTT",
    color: "text-orange-500",
    bgActive: "bg-orange-500/10 border-b-orange-500",
  },
};

export function RealtimeTabs() {
  const { activeProtocol, setActiveProtocol, connections } = useRealtimeStore();

  return (
    <div className="flex w-full items-center border-b  h-10 min-h-10">
      <div className="flex h-full w-full">
        {(Object.keys(protocolConfig) as Protocol[]).map((protocol) => {
          const config = protocolConfig[protocol];
          const connection = connections[protocol];
          const isActive = activeProtocol === protocol;

          return (
            <div
              key={protocol}
              onClick={() => setActiveProtocol(protocol)}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2 text-xs border-r select-none cursor-pointer transition-colors flex-1 h-9 justify-center",
                isActive
                  ? ` text-foreground border-b-2 ${config.bgActive}`
                  : " text-muted-foreground hover:bg-muted/30 border-b-transparent"
              )}
            >
              <span className={cn("font-bold text-[10px]", config.color)}>
                {config.shortLabel}
              </span>

              <span className="truncate font-medium text-[11px]">
                {config.label}
              </span>

              {connection.isConnected && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}