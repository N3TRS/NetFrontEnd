import { useState } from "react";
import { useRouter } from "next/navigation";

export function loginHook() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    if (!email || !password) {
      alert("Por favor llene todos los campos");
      setEmail("");
      setPassword("");
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const userData = await response.json();

      if (!response.ok) {
        alert(userData.message || "Error en el inicio de sesión");
        setIsPending(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error en el inicio de sesión");
      setIsPending(false);
    }
  };

  return { email, password, setEmail, setPassword, handleLogin, isPending };
}