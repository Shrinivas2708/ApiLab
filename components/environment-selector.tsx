"use client";

import { Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function EnvironmentSelector() {
  return (
    <div className="flex items-center gap-2 border-l pl-2 ml-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs font-normal h-8">
            <Layers size={14} />
            <span>No environment</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <div className="p-2">
            <Input placeholder="Search" className="h-8 text-xs" />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs gap-2">
            <Layers size={14} className="opacity-50"/> No environment
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Personal Environments</DropdownMenuLabel>
          <div className="p-4 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
             <Layers size={32} className="opacity-20" />
             <p className="text-xs">Environments are empty</p>
             <Button variant="outline" size="sm" className="h-7 text-xs w-full">Create New</Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
        <Eye size={16} />
      </Button>
    </div>
  );
}