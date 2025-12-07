"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Save, Check, Loader2, Plus } from "lucide-react";
import { useGraphqlStore } from "@/stores/graphql-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";

interface Collection {
  _id: string;
  name: string;
  children?: Collection[];
}

export function SaveGraphqlDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: session } = useSession();
  const store = useGraphqlStore();
  const activeTab = store.tabs.find(t => t.id === store.activeTabId);

  const [name, setName] = useState("");
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [isCreatingCol, setIsCreatingCol] = useState(false);



  const fetchCollections = async () => {
    if (session) {
        // Fetch from API
        try {
            const res = await fetch("/api/collections");
            if (res.ok) {
                const data = await res.json();
                // Simple transformation for flat list to tree if needed, or just flat for now
                setCollections(data); 
            }
        } catch (e) { console.error(e); }
    } else {
        // Fetch from Local Store
        setCollections(store.localCollections);
    }
  };
  useEffect(() => {
    if (activeTab && open) {
      function update(){
        setName(activeTab!.name || "Untitled Request");
      fetchCollections();
      }
      update()
    }
  }, [open, activeTab, session]);
  const handleCreateCollection = async () => {
      if(!newColName) return;
      if (session) {
          await fetch("/api/collections", {
              method: "POST",
              body: JSON.stringify({ name: newColName, parentId: null })
          });
      } else {
          store.createLocalCollection(newColName);
      }
      setNewColName("");
      setIsCreatingCol(false);
      fetchCollections();
  };

  const handleSave = async () => {
    if (!selectedColId || !activeTab) return;
    setLoading(true);

    const requestPayload = {
        name,
        method: "POST", // GraphQL is typically POST
        url: activeTab.url,
        headers: activeTab.headers,
        body: JSON.stringify({ query: activeTab.query, variables: activeTab.variables }),
        auth: activeTab.auth
    };

    if (session) {
      try {
        await fetch("/api/collections", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                collectionId: selectedColId,
                request: requestPayload
            })
        });
      } catch(e) { console.error(e) }
    } else {
        // Local Save
        store.saveRequestToCollection({ ...activeTab, name }, selectedColId, name);
    }

    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Select Collection</span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setIsCreatingCol(!isCreatingCol)}>
                    <Plus size={10} className="mr-1"/> New Collection
                </Button>
            </div>
            
            {isCreatingCol && (
                <div className="flex gap-2 mb-2">
                    <Input placeholder="Collection Name" value={newColName} onChange={e => setNewColName(e.target.value)} className="h-8 text-xs" />
                    <Button size="sm" className="h-8" onClick={handleCreateCollection}>Create</Button>
                </div>
            )}

            <div className="border rounded-md flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-1">
                        {collections.length === 0 && <p className="text-xs text-center p-4 text-muted-foreground">No collections found</p>}
                        {collections.map(col => (
                            <div 
                                key={col._id}
                                onClick={() => setSelectedColId(col._id)}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm ${selectedColId === col._id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                            >
                                <Folder size={14} className={selectedColId === col._id ? "fill-primary/20" : "fill-none"} />
                                {col.name}
                                {selectedColId === col._id && <Check size={14} className="ml-auto" />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading || !selectedColId} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}