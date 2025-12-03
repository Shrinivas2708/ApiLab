
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { KeyValue } from "@/stores/request-store";

interface KeyValueTableProps {
  items: KeyValue[];
  setItems: (items: KeyValue[]) => void;
}

export function KeyValueTable({ items, setItems }: KeyValueTableProps) {
  const updateItem = (id: string, field: keyof KeyValue, value: any) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), key: "", value: "", enabled: true },
    ]);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex font-mono text-xs text-muted-foreground px-2">
        <div className="w-8"></div>
        <div className="flex-1">Key</div>
        <div className="flex-1">Value</div>
        <div className="w-8"></div>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex gap-2 items-center group">
          <Checkbox
            checked={item.enabled}
            onCheckedChange={(checked) =>
              updateItem(item.id, "enabled", checked)
            }
          />
          <Input
            className="flex-1 h-8 font-mono text-sm"
            placeholder="Key"
            value={item.key}
            onChange={(e) => updateItem(item.id, "key", e.target.value)}
          />
          <Input
            className="flex-1 h-8 font-mono text-sm"
            placeholder="Value"
            value={item.value}
            onChange={(e) => updateItem(item.id, "value", e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => deleteItem(item.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="self-start mt-2 gap-2"
      >
        <Plus size={14} /> Add New
      </Button>
    </div>
  );
}