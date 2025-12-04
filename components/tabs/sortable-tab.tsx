"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface SortableTabProps {
  id: string;
  name: string;
  method: string;
  isActive: boolean;
  onClose: (id: string, e: React.MouseEvent) => void;
  onClick: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

const methodColors: Record<string, string> = {
  GET: "text-green-500",
  POST: "text-blue-500",
  PUT: "text-yellow-500",
  DELETE: "text-red-500",
  PATCH: "text-purple-500",
  HEAD: "text-gray-500",
  OPTIONS: "text-indigo-500",
};

export function SortableTab({
  id,
  name,
  method,
  isActive,
  onClose,
  onClick,
  onRename,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state with prop when not editing
  useEffect(() => {
    async function RR(){
      if (!isEditing) {
      setEditedName(name);
    }
    }
    RR()
  }, [name, isEditing]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onRename && editedName.trim() !== "") {
      onRename(id, editedName);
    } else {
      // Revert if empty
      setEditedName(name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedName(name); // Revert
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(id)}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2 text-xs border-r select-none cursor-pointer transition-colors min-w-[120px] max-w-[200px] h-9",
        isActive
          ? "bg-background text-foreground border-t-2 border-t-primary"
          : "bg-muted/50 text-muted-foreground hover:bg-muted border-t-2 border-t-transparent",
        isDragging && "opacity-50"
      )}
    >
      <span
        className={cn(
          "font-bold text-[10px]",
          methodColors[method] || "text-gray-500"
        )}
      >
        {method}
      </span>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none min-w-0 w-full"
          onClick={(e) => e.stopPropagation()} // Prevent drag/click when editing
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on input
        />
      ) : (
        <span className="truncate flex-1 font-mono text-[11px]">
          {name || "Untitled"}
        </span>
      )}

      {/* Close Button */}
      <div
        role="button"
        onClick={(e) => onClose(id, e)}
        className={cn(
          "rounded-sm opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-destructive p-0.5 transition-all ml-1",
          isActive && "opacity-100" 
        )}
      >
        <X size={12} />
      </div>
    </div>
  );
}