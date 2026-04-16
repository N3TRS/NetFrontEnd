import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function resetPasswordHook() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token no válido. Solicita un nuevo enlace.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_APIGATEWAY}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo restablecer la contraseña.");
        setIsPending(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intenta de nuevo.");
      setIsPending(false);
    }
  };

  return {
    token,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleReset,
    isPending,
    success,
    error,
  };
}
