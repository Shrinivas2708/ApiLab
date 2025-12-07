"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeStore } from "@/stores/realtime-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Trash2, ArrowUp, ArrowDown, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function RealtimeMessages() {
  const {
    activeProtocol,
    connections,
    sendMessage,
    clearMessages,
  } = useRealtimeStore();

  const connection = connections[activeProtocol];
  const [messageInput, setMessageInput] = useState("");

  const viewportRef = useRef<HTMLDivElement>(null);
const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!scrollRef.current) {
    scrollRef.current = document.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
  }

  scrollRef.current?.scrollTo({
    top: scrollRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [connection.messages.length]);


  if (!connection) return null;

  const handleSend = () => {
    if (!messageInput.trim() || !connection.isConnected) return;
    sendMessage(activeProtocol, messageInput);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative  overflow-hidden">
      
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 h-10">
        <span className="text-xs font-semibold text-muted-foreground">
          MESSAGES ({connection.messages.length})
        </span>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => clearMessages(activeProtocol)}
          disabled={connection.messages.length === 0}
        >
          <Trash2 size={12} className="mr-1" />
          Clear
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div ref={viewportRef} className="p-4 space-y-2 ">
          {connection.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Info size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">
                Connect and start sending data
              </p>
            </div>
          )}

          {connection.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 p-3 rounded-md text-sm",
                msg.type === "sent" && "bg-blue-500/10 border-l-2 border-blue-500",
                msg.type === "received" && "bg-green-500/10 border-l-2 border-green-500",
                msg.type === "error" && "bg-red-500/10 border-l-2 border-red-500",
                msg.type === "info" && "bg-muted/50 border-l-2 border-muted-foreground"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {msg.type === "sent" && <ArrowUp size={14} className="text-blue-500" />}
                {msg.type === "received" && <ArrowDown size={14} className="text-green-500" />}
                {msg.type === "error" && <AlertCircle size={14} className="text-red-500" />}
                {msg.type === "info" && <Info size={14} className="text-muted-foreground" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase",
                      msg.type === "sent" && "text-blue-500",
                      msg.type === "received" && "text-green-500",
                      msg.type === "error" && "text-red-500",
                      msg.type === "info" && "text-muted-foreground"
                    )}
                  >
                    {msg.type}
                  </span>

                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.timestamp), "HH:mm:ss.SSS")}
                  </span>
                </div>

                <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                  {msg.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {(activeProtocol === "websocket" || activeProtocol === "socketio") && (
        <div className="sticky bottom-0 border-t p-3 bg-background">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                connection.isConnected
                  ? "Type a message…"
                  : "Connect to send messages"
              }
              disabled={!connection.isConnected}
              className="flex-1 font-mono text-sm"
            />

            <Button
              onClick={handleSend}
              disabled={!connection.isConnected || !messageInput.trim()}
              size="sm"
              className="gap-2"
            >
              <Send size={14} />
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
