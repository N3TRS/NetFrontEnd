"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ProjectContextType {
  projectUrl: string | null
  setProjectUrl: (url: string) => void
  clearProjectUrl: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectUrl, setProjectUrlState] = useState<string | null>(null)

  const setProjectUrl = (url: string) => {
    setProjectUrlState(url)
  }

  const clearProjectUrl = () => {
    setProjectUrlState(null)
  }

  return (
    <ProjectContext.Provider value={{ projectUrl, setProjectUrl, clearProjectUrl }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider")
  }
  return context
}
