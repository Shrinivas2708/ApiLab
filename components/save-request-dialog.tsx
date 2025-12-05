"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Save, Check, Loader2, ChevronRight } from "lucide-react";
import { useRequestStore } from "@/stores/request-store";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Collection {
  _id: string;
  name: string;
  parentId: string | null;
  children?: Collection[];
}

export function SaveRequestDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { tabs, activeTabId } = useRequestStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Initial Name from Tab
  useEffect(() => {
    if (activeTab && open) {
      setName(activeTab.name || "Untitled Request");
      fetchCollections();
    }
  }, [open, activeTab]);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        // Simple tree builder
        const map: any = {};
        const tree: any[] = [];
        data.forEach((c: any) => map[c._id] = { ...c, children: [] });
        data.forEach((c: any) => {
          if (c.parentId && map[c.parentId]) map[c.parentId].children.push(map[c._id]);
          else tree.push(map[c._id]);
        });
        setCollections(tree);
      }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!selectedColId || !activeTab) return;
    setLoading(true);

    try {
      const payload = {
        collectionId: selectedColId,
        request: {
          name,
          method: activeTab.method,
          url: activeTab.url,
          headers: activeTab.headers,
          body: activeTab.body,
          bodyType: activeTab.bodyType
        }
      };

      const res = await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");
      
      setOpen(false);
      alert("Saved successfully!"); // Or use a toast here
    } catch (err) {
      console.error(err);
      alert("Error saving request");
    } finally {
      setLoading(false);
    }
  };

  // Recursive Folder Selector Item
  const FolderItem = ({ col, depth = 0 }: { col: Collection, depth?: number }) => (
    <div className="select-none">
      <div 
        onClick={() => setSelectedColId(col._id)}
        className={`
          flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm
          ${selectedColId === col._id ? "bg-primary/10 text-primary" : "hover:bg-muted"}
        `}
        style={{ paddingLeft: `${(depth * 16) + 8}px` }}
      >
        <Folder size={14} className={selectedColId === col._id ? "fill-primary/20" : "fill-none"} />
        {col.name}
        {selectedColId === col._id && <Check size={14} className="ml-auto" />}
      </div>
      {col.children?.map(child => <FolderItem key={child._id} col={child} depth={depth + 1} />)}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Save className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Request Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1 h-[250px] flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Select Collection</span>
            <div className="border rounded-md flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-1">
                        {collections.length === 0 && <p className="text-xs text-center p-4 text-muted-foreground">No collections found</p>}
                        {collections.map(col => <FolderItem key={col._id} col={col} />)}
                    </div>
                </ScrollArea>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading || !selectedColId} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Save to Collection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}