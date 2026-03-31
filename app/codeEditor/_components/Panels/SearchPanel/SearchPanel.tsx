"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Search
        </h2>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-2">
        <p className="text-sm text-muted-foreground">
          Type to search across all files
        </p>
      </div>
    </div>
  );
}
