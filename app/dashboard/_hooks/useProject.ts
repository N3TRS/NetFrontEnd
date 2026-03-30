"use client";
import { ProjectSession } from "../_types/session";

export interface ProjectSessionProps {
  projectConfiguration: ProjectSession;
}

export type ProjectStructure = {
  [key: string]: {
    type: "file" | "directory";
    content?: string;
    children?: ProjectStructure;
  };
};

export interface ProjectCreateResponse {
  success: boolean;
  data?: {
    status: string;
    project: ProjectStructure;
  };
  error?: string;
}

export default function useProject() {
  async function handleProject({
    projectConfiguration,
  }: ProjectSessionProps): Promise<ProjectCreateResponse> {
    try {
      const res = await fetch(`http://localhost:3001/orchestrator/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectConfiguration),
      });

      if (res.status !== 201) {
        let errorMessage = "Failed to create project. Please try again.";
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {}

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await res.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      return {
        success: false,
        error: "Could not connect to server. Check your connection.",
      };
    }
  }

  return { handleProject };
}
