"use client";

export function githubLoginHook() {
  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_AUTH_API_URL}/auth/github`;
  };

  return { handleGithubLogin };
}
