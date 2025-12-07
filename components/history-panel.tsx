"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/stores/request-store";
import { formatDistanceToNow } from "date-fns";

interface HistoryItem {
  method: string;
  url: string;
  date: string | number;
  status: number;
  duration: number;
}

export function HistoryPanel() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { addTab, updateActiveTab } = useRequestStore();
  const [search, setSearch] = useState("");

  const loadHistory = async () => {
    if (session) {
      try {
        const res = await fetch("/api/history");
        if(res.ok) setHistory(await res.json());
      } catch(e) { console.error(e) }
    } else {
      const local = JSON.parse(localStorage.getItem("apilab_history") || "[]");
      setHistory(local);
    }
  };

  useEffect(() => {
 function load(){
       loadHistory();
 }
 load()
    // Poll every few seconds to keep history fresh without complex websockets
    const interval = setInterval(loadHistory, 3000); 
    return () => clearInterval(interval);
  }, [session]);

  const restoreRequest = (item: HistoryItem) => {
    addTab();
    setTimeout(() => {
        updateActiveTab({
            method: item.method,
            url: item.url,
            isDirty: false
        });
    }, 50);
  };

  const clearHistory = async () => {
      if(!confirm("Are you sure you want to clear all history?")) return;
      
      if (session) {
          // Call the new DELETE API
          try {
            await fetch("/api/history", { method: "DELETE" });
            setHistory([]);
          } catch (e) {
            console.error("Failed to clear history", e);
          }
      } else {
          // Clear LocalStorage
          localStorage.removeItem("apilab_history");
          setHistory([]);
      }
  }

  const filtered = history.filter(h => h.url.toLowerCase().includes(search.toLowerCase()));

  // Group by timeframe
  const grouped = filtered.reduce((acc, item) => {
      const date = new Date(item.date);
      const today = new Date();
      let key = "Older";
      if(date.toDateString() === today.toDateString()) key = "Today";
      else if(date.getDate() === today.getDate() - 1) key = "Yesterday";
      
      if(!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
  }, {} as Record<string, HistoryItem[]>);

  const getMethodColor = (m: string) => {
      if(m === 'GET') return 'text-green-500';
      if(m === 'POST') return 'text-blue-500';
      if(m === 'DELETE') return 'text-red-500';
      if(m === 'PUT' || m === 'PATCH') return 'text-yellow-500';
      return 'text-gray-500';
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input 
                placeholder="Filter history..." 
                className="h-8 pl-8 text-xs bg-muted/20 border-transparent focus:border-primary/50" 
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <Trash2 size={14} className="absolute right-2 top-2.5 text-muted-foreground hover:text-destructive cursor-pointer" onClick={clearHistory} />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col pb-4">
          {Object.entries(grouped).map(([label, items]) => (
             <div key={label}>
                <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase bg-muted/5 flex items-center gap-2">
                    <Calendar size={10} /> {label}
                </div>
                {items.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 border-b border-border/20 hover:bg-muted/10 cursor-pointer group" onClick={() => restoreRequest(item)}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`text-[10px] font-mono font-bold w-8 shrink-0 ${getMethodColor(item.method)}`}>{item.method}</span>
                        <span className="text-xs truncate flex-1 text-foreground/80 group-hover:text-foreground" title={item.url}>{item.url}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pl-11">
                        <span>{formatDistanceToNow(new Date(item.date))} ago</span>
                        {item.status && <div className="flex gap-2"><span>{item.duration}ms</span><span className={item.status < 300 ? "text-green-500" : "text-red-500"}>{item.status}</span></div>}
                    </div>
                    </div>
                ))}
             </div>
          ))}
          {history.length === 0 && <div className="p-8 text-center text-xs text-muted-foreground">No history yet</div>}
        </div>
      </ScrollArea>
    </div>
  );
}