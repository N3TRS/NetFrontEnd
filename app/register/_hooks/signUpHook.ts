import { useState } from "react";
import { useRouter } from "next/navigation";


export function useSignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    if (!name || !email || !password) {
      alert("Por favor llene todos los campos");
      setName("");
      setEmail("");
      setPassword("");
      setIsPending(false);
      return;
    }

    try {
      const API = process.env.NEXT_PUBLIC_URL_APIGATEWAY || 'http://localhost:3002';
      const response = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const userData = await response.json();

      if (!response.ok) {
        alert(userData.message || "Error en el registro");
        setIsPending(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(userData));
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error en el registro");
      setIsPending(false);
    }
  };

  return {
    name,
    email,
    password,
    setName,
    setEmail,
    setPassword,
    handleSignUp,
    isPending,
  };
}
