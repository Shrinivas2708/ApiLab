"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  Plus,
  MoreVertical,
  Search,
  ChevronRight,
  Trash,
  FileCode,
  FolderPlus,
  FolderTree,
  History,
  Clock,
  CodeIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRequestStore } from "@/stores/request-store";
import { cn } from "@/lib/utils";
import { HistoryPanel } from "./history-panel";
import { CodeSnippet } from "./code-snippet";

interface CollectionType {
  _id: string;
  name: string;
  parentId: string | null;
  requests: any[];
  children?: CollectionType[];
}

const buildTree = (items: CollectionType[]) => {
  const dataMap: Record<string, CollectionType> = {};
  const tree: CollectionType[] = [];
  items.forEach((item) => (dataMap[item._id] = { ...item, children: [] }));
  items.forEach((item) => {
    if (item.parentId && dataMap[item.parentId]) {
      dataMap[item.parentId].children?.push(dataMap[item._id]);
    } else {
      tree.push(dataMap[item._id]);
    }
  });
  return tree;
};

export default function CollectionsPanel() {
  const [activeView, setActiveView] = useState<"collections" | "history" | "code">(
    "collections"
  );

  return (
    <div className="flex h-full w-full bg-[#111111] text-foreground border-l border-border/40">
      {/* 1. Left Icon Strip */}
      <div className="w-10 flex flex-col items-center py-4 border-r border-border/40 gap-4 bg-muted/5">
        <button
          onClick={() => setActiveView("collections")}
          className={cn(
            "p-2 rounded-md transition-all",
            activeView === "collections"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Collections"
        >
          <FolderTree size={18} />
        </button>
        <button
          onClick={() => setActiveView("history")}
          className={cn(
            "p-2 rounded-md transition-all",
            activeView === "history"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="History"
        >
          <History size={18} />
        </button>
        <button
          onClick={() => setActiveView("code")}
          className={cn(
            "p-2 rounded-md transition-all",
            activeView === "code"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Code Snippet"
        >
          <CodeIcon size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {activeView === "collections" ? <CollectionTree /> : activeView === "history" ? <HistoryPanel /> : <CodeSnippet />}
      </div>
    </div>
  );
}

function CollectionTree() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { addTab, updateActiveTab } = useRequestStore();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [targetParentId, setTargetParentId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const flatData = await res.json();
        const tree = buildTree(flatData);
        setCollections(tree);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    function load(){
      fetchData();
    }
    load()
  }, [session]);

  const openCreateDialog = (parentId: string | null = null) => {
    setTargetParentId(parentId);
    setNewFolderName("");
    setCreateDialogOpen(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/collections", {
      method: "POST",
      body: JSON.stringify({
        name: newFolderName,
        parentId: targetParentId,
        requests: [],
      }),
    });
    setCreateDialogOpen(false);
    fetchData();
  };

  const handleDeleteCollection = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will delete the folder and all requests inside."
      )
    )
      return;
    await fetch(`/api/collections?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const loadRequest = (req: any, collectionId: string) => {
    addTab();
    setTimeout(() => {
      updateActiveTab({
        ...req,
        savedId: req._id,
        collectionId: collectionId,
        isDirty: false,
        variables:
          req.variables?.map((v: any) => ({
            ...v,
            id: v.id || crypto.randomUUID(),
          })) || [],
      });
    }, 50);
  };

  if (!session)
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-center text-muted-foreground gap-2">
        <p>Please Login to view Collections</p>
      </div>
    );

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

      <div className="px-2 py-2">
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
          {collections.map((col) => (
            <CollectionItem
              key={col._id}
              item={col}
              onCreateSub={openCreateDialog}
              onLoadReq={loadRequest}
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
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollectionItem({ item, onCreateSub, onLoadReq, onDelete }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pl-2 border-l border-transparent hover:border-border/50 transition-colors">
      <div className="flex items-center group justify-between py-1 px-2 rounded-md hover:bg-muted/10 cursor-pointer">
        <div
          className="flex items-center gap-2 overflow-hidden flex-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronRight
            size={12}
            className={`text-muted-foreground transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
          <Folder
            size={14}
            className="text-amber-500 fill-amber-500/10 shrink-0"
          />
          <span className="text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors">
            {item.name}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onCreateSub(item._id)}>
              <FolderPlus size={12} className="mr-2" /> New Folder
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(item._id)}
            >
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
              onCreateSub={onCreateSub}
              onLoadReq={onLoadReq}
              onDelete={onDelete}
            />
          ))}
          {item.requests?.map((req: any, i: number) => (
            <div
              key={i}
              onClick={() => onLoadReq(req, item._id)}
              className="flex items-center gap-2 py-1.5 px-6 rounded-md hover:bg-muted/20 cursor-pointer group"
            >
              <span
                className={`text-[9px] font-bold w-7 text-right ${
                  req.method === "GET"
                    ? "text-emerald-500"
                    : req.method === "POST"
                    ? "text-blue-500"
                    : req.method === "DELETE"
                    ? "text-red-500"
                    : "text-orange-500"
                }`}
              >
                {req.method}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground truncate">
                {req.name}
              </span>
            </div>
          ))}
          {!item.children?.length && !item.requests?.length && (
            <div className="py-2 text-[10px] text-muted-foreground/50 text-center">
              Empty Folder
            </div>
          )}
        </div>
      )}
    </div>
  );
}
