"use client";
import { useEffect, useState } from 'react';
import { ProjectSession } from '../_types/session';


export interface ProjectSessionProps {

  projectConfiguration: ProjectSession,

}

export default function useProject() {

  async function handleProject({ projectConfiguration }: ProjectSessionProps) {

    const res = await fetch(``, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectConfiguration)
    })


    const data = await res.json();

  }

  return { handleProject }

}
