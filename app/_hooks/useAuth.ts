"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * User data stored in localStorage
 */
export interface AuthUser {
  email: string;
  token: string;
  role?: string;
}

interface UseAuthResult {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshAuth: () => void;
}

/**
 * Decode JWT payload without verification (client-side only)
 */
function decodeJwtPayload(token: string): { email?: string; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Hook for accessing authentication state from localStorage
 * Works with both GitHub OAuth and email/password login flows
 */
export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuth = useCallback(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      
      // Format 1: { token: "jwt..." } (from GitHub OAuth)
      // Format 2: { token: "jwt...", email: "...", ... } (from email login)
      const token = parsed.token;
      
      if (!token || typeof token !== "string") {
        setUser(null);
        setIsLoading(false);
        return;
      }

      let email: string | undefined;
      let role: string | undefined;

      // If email is in storage, use it
      if (parsed.email) {
        email = parsed.email;
        role = parsed.role;
      } else {
        // Otherwise, decode from JWT
        const payload = decodeJwtPayload(token);
        if (payload) {
          email = payload.email;
          role = payload.role;
        }
      }

      if (email) {
        setUser({ email, token, role });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("[useAuth] Failed to parse stored user data:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuth();

    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadAuth]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const refreshAuth = useCallback(() => {
    loadAuth();
  }, [loadAuth]);

  return {
    user,
    token: user?.token ?? null,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshAuth,
  };
}
