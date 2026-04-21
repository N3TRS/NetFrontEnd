import { useState } from "react";

export function forgotPasswordHook() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_APIGATEWAY}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      setSubmitted(true);
    } finally {
      setIsPending(false);
    }
  };

  return { email, setEmail, handleForgot, isPending, submitted };
}
