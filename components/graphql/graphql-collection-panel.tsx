"use client";

import { useEffect, useState } from "react";
import { Folder, Search, ChevronRight, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { useGraphqlStore } from "@/stores/graphql-store";

interface CollectionType {
  _id: string;
  name: string;
  requests: any[];
  children?: CollectionType[];
}

export default function GraphQlCollectionPanel() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { addTab, updateActiveTab, localCollections } = useGraphqlStore();

  useEffect(() => {
    async function load() {
        if (session) {
            try {
                const res = await fetch("/api/collections");
                if(res.ok) setCollections(await res.json());
            } catch(e) { console.error(e) }
        } else {
            // Load from Local Store
            // We map the stored local collections to the view format
            setCollections(localCollections as unknown as CollectionType[]);
        }
    }
    load();
  }, [session, localCollections]);

  const loadRequest = (req: any) => {
    addTab();
    setTimeout(() => {
        // Parse body if it came from API as a string
        let q = req.query;
        let v = req.variables;
        
        if (!q && req.body) {
            try {
                const parsed = JSON.parse(req.body);
                q = parsed.query;
                v = parsed.variables ? JSON.stringify(parsed.variables, null, 2) : "{}";
            } catch (e) { /* ignore */ }
        }

        updateActiveTab({
            name: req.name,
            url: req.url,
            headers: req.headers,
            query: q || "",
            variables: v || "{}",
            auth: req.auth || { type: 'none' },
            isDirty: false
        });
    }, 50);
  };

  const filtered = collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
        Collections
      </div>

      <div className="px-2 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="h-8 pl-8 text-xs bg-muted/20 border-transparent focus:border-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {filtered.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No collections</div>}
          {filtered.map((col) => (
            <CollectionItem key={col._id} item={col} onLoadReq={loadRequest} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function CollectionItem({ item, onLoadReq }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pl-1">
      <div 
        className="flex items-center group justify-between py-1.5 px-2 rounded-md hover:bg-muted/10 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <ChevronRight size={12} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
          <Folder size={14} className="text-amber-500 fill-amber-500/10 shrink-0" />
          <span className="text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors">
            {item.name}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="ml-2 border-l border-border/30 pl-1 mt-1">
          {item.requests?.map((req: any, i: number) => (
            <div
              key={i}
              onClick={() => onLoadReq(req)}
              className="flex items-center gap-2 py-1.5 px-4 rounded-md hover:bg-muted/20 cursor-pointer group"
            >
              <span className="text-[9px] font-bold text-pink-500 w-6 text-right">GQL</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground truncate flex-1">
                {req.name}
              </span>
              <Play size={10} className="opacity-0 group-hover:opacity-100 text-green-500" />
            </div>
          ))}
          {(!item.requests || item.requests.length === 0) && (
              <div className="text-[10px] text-muted-foreground/40 pl-6 py-1">Empty</div>
          )}
        </div>
      )}
    </div>
  );
}