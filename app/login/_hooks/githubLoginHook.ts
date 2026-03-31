"use client";

export function githubLoginHook() {
    const handleGithubLogin = () => {
        window.location.href = `http://localhost:3000/auth/github`;
    };

    return { handleGithubLogin };
}
