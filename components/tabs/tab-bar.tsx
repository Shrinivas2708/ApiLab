"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useRequestStore } from "@/stores/request-store";
import { SortableTab } from "./sortable-tab";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, reorderTabs, closeTab, addTab, updateTab } =
    useRequestStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: { distance: 3 } 
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTabs(active.id as string, over.id as string);
    }
  };

  const handleClose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    closeTab(id);
  };

  const handleRename = (id: string, newName: string) => {
    updateTab(id, { name: newName });
  };

  return (
    <div className="flex w-full items-center border-b bg-muted/20 h-10 min-h-10">
      {/* LAYOUT FIX: 
         1. Added `min-w-0` to allow the ScrollArea to shrink below its content size in a flex container.
         2. Removed `w-full` which forces 100% width, fighting against the Add button.
      */}
      <ScrollArea className="flex-1 min-w-0 w-full whitespace-nowrap border-r">
        <div className="flex h-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tabs.map((t) => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  id={tab.id}
                  name={tab.name || tab.url || "Untitled"}
                  method={tab.method}
                  isActive={tab.id === activeTabId}
                  onClick={setActiveTab}
                  onClose={handleClose}
                  onRename={handleRename}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5" />
      </ScrollArea>
      
      {/* Added `shrink-0` so this container doesn't collapse when many tabs are open */}
      <div className="px-1 h-full flex items-center bg-background shrink-0">
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={addTab}
        >
          <Plus size={14} />
        </Button>
      </div>
    </div>
  );
}