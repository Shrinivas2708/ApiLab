"use client";

import { useEffect, useState } from "react";
import { Folder, Search, ChevronRight, Play, Plus, FolderPlus, Trash, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { useGraphqlStore } from "@/stores/graphql-store";
import { Button } from "@/components/ui/button"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CollectionType {
  _id: string;
  name: string;
  parentId: string | null; 
  requests: any[];
  children?: CollectionType[];
}

export default function GraphQlCollectionPanel() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const { addTab, updateActiveTab, localCollections, createLocalCollection } = useGraphqlStore();

  const fetchData = async () => {
    if (session) {
      try {
        const res = await fetch("/api/collections?type=GRAPHQL");
        if (res.ok) setCollections(await res.json());
      } catch (e) {
        console.error(e);
      }
    } else {
      setCollections(localCollections as unknown as CollectionType[]);
    }
  };

  useEffect(() => {
    function fetch(){
      fetchData();
    }
    fetch()
  }, [session, localCollections]);

  const openCreateDialog = (parentId: string | null = null) => {
    setTargetParentId(parentId);
    setNewFolderName("");
    setCreateDialogOpen(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    if (session) {
      try {
        await fetch("/api/collections", {
          method: "POST",
          body: JSON.stringify({
            name: newFolderName,
            parentId: targetParentId,
            requests: [],
            type: "GRAPHQL" 
          }),
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      createLocalCollection(newFolderName);
    }

    setCreateDialogOpen(false);
    fetchData();
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Are you sure? This will delete the folder and all requests inside.")) return;
    
    if (session) {
        await fetch(`/api/collections?id=${id}`, { method: "DELETE" });
        fetchData();
    } else {
        console.log("Local delete not implemented in this snippet");
    }
  };

  const loadRequest = (req: any) => {
    addTab();
    setTimeout(() => {
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
      <div className="px-4 py-3 text-xs text-muted-foreground flex items-center justify-between border-b border-border/40">
        <span className="font-semibold text-foreground">Collections</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => openCreateDialog(null)}
        >
          <Plus size={14} />
        </Button>
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
            <CollectionItem 
                key={col._id} 
                item={col} 
                onLoadReq={loadRequest}
                onCreateSub={openCreateDialog}
                onDelete={handleDeleteCollection} 
            />
          ))}
        </div>
      </ScrollArea>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollectionItem({ item, onLoadReq, onCreateSub, onDelete }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pl-1 border-l border-transparent hover:border-border/30 transition-colors">
      <div className="flex items-center group justify-between py-1.5 px-2 rounded-md hover:bg-muted/10 cursor-pointer select-none">
        <div
          className="flex items-center gap-2 overflow-hidden flex-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronRight size={12} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
          <Folder size={14} className="text-amber-500 fill-amber-500/10 shrink-0" />
          <span className="text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors">
            {item.name}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
              <MoreVertical size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onCreateSub(item._id)}>
              <FolderPlus size={12} className="mr-2" /> New Folder
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => onDelete(item._id)}>
              <Trash size={12} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isOpen && (
        <div className="ml-2 border-l border-border/30 pl-1 mt-1">
         
          {item.children?.map((child: any) => (
            <CollectionItem 
                key={child._id} 
                item={child} 
                onLoadReq={onLoadReq} 
                onCreateSub={onCreateSub} 
                onDelete={onDelete} 
            />
          ))}

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
          {!item.children?.length && (!item.requests || item.requests.length === 0) && (
            <div className="text-[10px] text-muted-foreground/40 pl-6 py-1">Empty</div>
          )}
        </div>
      )}
    </div>
  );
}