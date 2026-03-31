"use client";

export function githubLoginHook() {
    const handleGithubLogin = () => {
        window.location.href = `http://localhost:3002/auth/github`;
    };

    return { handleGithubLogin };
}
