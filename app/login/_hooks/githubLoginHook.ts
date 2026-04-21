"use client";

export function githubLoginHook() {
  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_URL_APIGATEWAY}/auth/github`;
  };

  return { handleGithubLogin };
}
