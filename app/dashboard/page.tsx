"use client";

import { FolderOpen, ArrowRight, Users, Link2 } from "lucide-react";
import EmptyState from "./_components/EmptyState";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useState } from "react";
import SelectProject from "./_components/SelectProject";


export default function Dashboard() {

  const { token, isLoading: authLoading } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <>
      <div
        className={`section-container mx-auto py-8 flex flex-col gap-8 transition-all duration-300  "blur-sm pointer-events-none select-none" : ""
          }`}
      >
        <hr className="border-white/5" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Proyectos Spring Boot</h2>
          </div>
        </div>
        <EmptyState onSelectProject={() => setConfigOpen(true)} />
      </div>
      <SelectProject
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </>
  );
}
