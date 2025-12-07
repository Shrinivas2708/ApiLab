"use client";

import { useEffect, useState } from "react";
import { Eye, Layers, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRequestStore, Environment, KeyValue } from "@/stores/request-store";
import { KeyValueTable } from "./key-value-table";
import { useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function EnvironmentSelector() {
  const { data: session } = useSession();
  const store = useRequestStore();

  const activeEnv = store.environments.find((e) => e._id === store.activeEnvId);
  const [openEditor, setOpenEditor] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Partial<Environment>>({
    name: "",
    variables: [],
  });

  useEffect(() => {
    if (session?.user) {
      // User is logged in: Fetch environments from DB
      fetch("/api/environments")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) store.setEnvironments(data);
        })
        .catch((err) => console.error(err));
    } else {
      // User is logged out: Clear environments from local store
      store.setEnvironments([]);
      store.setActiveEnvId(null);
    }
  }, [session]);

  const handleCreate = () => {
    setEditingEnv({
      name: "New Environment",
      variables: [
        { id: crypto.randomUUID(), key: "", value: "", enabled: true },
      ],
    });
    setOpenEditor(true);
  };

  const handleEdit = (e: React.MouseEvent, env: Environment) => {
    e.stopPropagation();
    // Safe access to variables with fallback
    setEditingEnv({
      ...env,
      variables: (env.variables || []).map((v) => ({ ...v })),
    });
    setOpenEditor(true);
  };

  const saveEnvironment = async () => {
    if (!editingEnv.name) return;

    try {
      const method = editingEnv._id ? "PUT" : "POST";
      const res = await fetch("/api/environments", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEnv),
      });

      // FIXED: Read error message from server before throwing
      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({ error: "Unknown server error" }));
        throw new Error(errData.error || "Failed to save");
      }

      const data = await res.json();
      if (editingEnv._id) {
        store.updateEnvironment(data);
      } else {
        store.addEnvironment(data);
      }
      setOpenEditor(false);
    } catch (e: any) {
      console.error("Save error:", e);
      alert(e.message); // Show the actual error to the user
    }
  };

  const deleteEnvironment = async () => {
    if (!editingEnv._id) return;
    await fetch(`/api/environments?id=${editingEnv._id}`, { method: "DELETE" });
    store.deleteEnvironment(editingEnv._id);
    setOpenEditor(false);
  };

  return (
    <div className="flex items-center gap-1 border-l pl-2 ml-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs font-normal h-8 max-w-[150px] justify-start"
          >
            <Layers size={14} className="shrink-0" />
            <span className="truncate">
              {activeEnv ? activeEnv.name : "No Environment"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[250px]">
          <DropdownMenuLabel className="text-xs">
            Select Environment
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="text-xs gap-2 cursor-pointer"
            onClick={() => store.setActiveEnvId(null)}
          >
            <div className="w-4 flex justify-center">
              {!activeEnv && <Check size={12} />}
            </div>
            No environment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {store.environments.map((env) => (
            <DropdownMenuItem
              key={env._id}
              className="text-xs gap-2 cursor-pointer group"
              onClick={() => store.setActiveEnvId(env._id)}
            >
              <div className="w-4 flex justify-center">
                {activeEnv?._id === env._id && <Check size={12} />}
              </div>
              <span className="flex-1 truncate">{env.name}</span>
              <Pencil
                size={12}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                onClick={(e) => handleEdit(e, env)}
              />
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs gap-2 cursor-pointer"
            onClick={handleCreate}
          >
            <Plus size={12} /> Create New
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <VariablePreviewTrigger />

      <Dialog open={openEditor} onOpenChange={setOpenEditor}>
        <DialogContent className="sm:max-w-2xl h-[60vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingEnv._id ? "Edit Environment" : "Create Environment"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 flex-1 min-h-0 py-2">
            <Input
              value={editingEnv.name}
              onChange={(e) =>
                setEditingEnv((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Environment Name"
            />
            <div className="flex-1 border rounded-md overflow-hidden relative">
              <div className="absolute inset-0 overflow-auto">
                <KeyValueTable
                  items={editingEnv.variables || []}
                  setItems={(vars) =>
                    setEditingEnv((prev) => ({ ...prev, variables: vars }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between! w-full sm:justify-between">
            {editingEnv._id ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteEnvironment}
              >
                <Trash2 size={14} className="mr-2" /> Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenEditor(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={saveEnvironment}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VariablePreviewTrigger() {
  const store = useRequestStore();
  const activeEnv = store.environments.find((e) => e._id === store.activeEnvId);

  // FIX: Safely access variables with optional chaining (?.)
  const envVars = activeEnv?.variables || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
        >
          <Eye size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex flex-col max-h-[500px]">
          <div className="p-3 border-b bg-muted/10">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              Global Variables
            </h4>
          </div>
          <div className="p-0">
            {store.globalVariables.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 italic">
                No global variables
              </p>
            ) : (
              <VariableList vars={store.globalVariables} />
            )}
          </div>

          <div className="p-3 border-b border-t bg-muted/10 flex justify-between items-center">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              {activeEnv ? activeEnv.name : "Environment Variables"}
            </h4>
            {!activeEnv && (
              <span className="text-[10px] text-muted-foreground">
                (No Environment Selected)
              </span>
            )}
          </div>
          <div className="p-0 overflow-y-auto">
            {/* FIX: Use the safe envVars variable defined above */}
            {activeEnv && envVars.length > 0 ? (
              <VariableList vars={envVars} />
            ) : (
              <p className="text-xs text-muted-foreground p-3 italic">
                No environment variables
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function VariableList({ vars }: { vars: KeyValue[] }) {
  return (
    <table className="w-full text-xs text-left">
      <thead>
        <tr className="text-muted-foreground border-b">
          <th className="px-3 py-2 font-medium">Name</th>
          <th className="px-3 py-2 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {vars
          .filter((v) => v.enabled && v.key)
          .map((v) => (
            <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="px-3 py-2 font-mono text-primary">{v.key}</td>
              <td
                className="px-3 py-2 font-mono text-muted-foreground truncate max-w-[200px]"
                title={v.value}
              >
                {v.value}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
