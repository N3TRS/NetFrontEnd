"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { ProjectSession } from "../_types/session";
import ProjectLoadingModal from "@/components/ui/ProjectLoadingModal";

const SPRING_VERSIONS = ["3.5.11", "4.0.3"];
const JAVA_VERSIONS = ["25", "21", "17"];
const CONFIG_OPTIONS = ["Properties"];

interface ProjectConfigurationProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: (session: ProjectSession) => void;
}

function toPackageSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

export default function ProjectConfiguration({
  open,
  onClose,
  onProjectCreated,
}: ProjectConfigurationProps) {
  const [springVersion, setSpringVersion] = useState("3.5.11");
  const [javaVersion, setJavaVersion] = useState("21");
  const [configuration, setConfiguration] = useState("Properties");
  const [group, setGroup] = useState("com.example");
  const [artifact, setArtifact] = useState("demo");
  const [name, setName] = useState("demo");
  const [description, setDescription] = useState("");
  const [packageName, setPackageName] = useState("com.example.demo");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [packageNameTouched, setPackageNameTouched] = useState(false);

  const handleArtifactChange = (value: string) => {
    setArtifact(value);
    if (!nameTouched) {
      setName(value);
    }
    if (!packageNameTouched) {
      const segment = toPackageSegment(value);
      setPackageName(segment ? `${group}.${segment}` : group);
    }
  };

  const handleGroupChange = (value: string) => {
    setGroup(value);
    if (!packageNameTouched) {
      const segment = toPackageSegment(artifact);
      setPackageName(segment ? `${value}.${segment}` : value);
    }
  };

  const handleNameChange = (value: string) => {
    setNameTouched(true);
    setName(value);
  };

  const handlePackageNameChange = (value: string) => {
    setPackageNameTouched(true);
    setPackageName(value);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    const session: ProjectSession = {
      containerId: crypto.randomUUID(),
      name,
      artifact,
      group,
      packageName,
      javaVersion,
      springVersion,
      description,
    };

    setGenerating(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(255,139,16,0.15)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="text-primary text-xl">&#10022;</span>
            <h1 className="text-white text-2xl font-semibold tracking-tight font-sans">
              Project Configuration
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-noir p-5 flex flex-col gap-5">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Project Type
              </label>
              <div className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-2.5 text-sm text-center">
                Maven
              </div>
              <div>
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase block mb-3">
                  Spring Boot Version
                </label>
                <div className="flex gap-5">
                  {SPRING_VERSIONS.map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        onClick={() => setSpringVersion(v)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          springVersion === v
                            ? "border-primary"
                            : "border-white/20"
                        }`}
                      >
                        {springVersion === v && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground/70">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-noir p-5 flex flex-col gap-5">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">
                Language
              </label>
              <div className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-2.5 text-sm text-center">
                Java
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">
                    Packaging
                  </label>
                  <div className="w-full bg-white/5 border border-white/10 text-foreground/70 text-sm rounded-lg px-3 py-2">
                    Jar
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] tracking-widest text-muted-foreground uppercase">
                    Java Version
                  </label>
                  <div className="relative">
                    <select
                      value={javaVersion}
                      onChange={(e) => setJavaVersion(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-foreground/70 text-sm rounded-lg px-3 py-2 appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors"
                    >
                      {JAVA_VERSIONS.map((v) => (
                        <option key={v} value={v} className="bg-[#0d1117]">
                          {v}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      &#9662;
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase block mb-3">
                  Configuration
                </label>
                <div className="flex gap-5">
                  {CONFIG_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        onClick={() => setConfiguration(opt)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          configuration === opt
                            ? "border-primary"
                            : "border-white/20"
                        }`}
                      >
                        {configuration === opt && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm text-foreground/70">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card-noir p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="text-primary text-base font-mono">{"{ }"}</span>
              <h2 className="text-white text-base font-semibold">
                Project Metadata
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Group" value={group} onChange={handleGroupChange} />
              <Field
                label="Artifact"
                value={artifact}
                onChange={handleArtifactChange}
              />
              <Field label="Name" value={name} onChange={handleNameChange} />
              <Field
                label="Description"
                value={description}
                onChange={setDescription}
              />
            </div>

            <Field
              label="Package name"
              value={packageName}
              onChange={handlePackageNameChange}
              className="md:w-1/2"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-3 bg-primary hover:bg-primary/85 disabled:opacity-60 text-primary-foreground font-semibold rounded-xl px-8 py-3.5 text-sm transition-all active:scale-95 cursor-pointer glow-orange"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-5 h-5 ${generating ? "animate-spin" : ""}`}
              >
                {generating ? (
                  <path
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
                    opacity=".3"
                  />
                ) : (
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                )}
              </svg>
              <span>{generating ? "Generating..." : "Generate Project"}</span>
            </button>
          </div>
        </div>
      </div>

      <ProjectLoadingModal
        open={generating}
        title="Creating Project"
        message="Setting up your Spring Boot project with Kubernetes deployment. This may take 30-60 seconds..."
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] tracking-widest text-muted-foreground uppercase">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 text-foreground/80 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}
