"use client";

import { useState, useEffect, useCallback } from "react";
import type { GithubRepo } from "../_types/github-repo";

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3000";

interface UseGithubReposResult {
  repos: GithubRepo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGithubRepos(token: string | null): UseGithubReposResult {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AUTH_API_URL}/users/github/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Error al obtener los repositorios");
      }

      const data: GithubRepo[] = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, loading, error, refetch: fetchRepos };
}
