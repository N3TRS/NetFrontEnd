"use client"

import { createContext, useContext, useState, ReactNode } from "react"

const SESSION_KEY = "selected_project_url"

interface ProjectContextType {
  projectUrl: string | null
  setProjectUrl: (url: string) => void
  clearProjectUrl: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectUrl, setProjectUrlState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(SESSION_KEY)
  })

  const setProjectUrl = (url: string) => {
    sessionStorage.setItem(SESSION_KEY, url)
    setProjectUrlState(url)
  }

  const clearProjectUrl = () => {
    sessionStorage.removeItem(SESSION_KEY)
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
