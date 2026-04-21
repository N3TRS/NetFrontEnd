import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export function signUpHook() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_APIGATEWAY}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password } as SignUpRequest),
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
