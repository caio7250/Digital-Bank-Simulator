"use client";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        email,
        senha,
      });

      localStorage.setItem("usuario", JSON.stringify(response.data));
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.error || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_2fr]">
      <div className="hidden flex-col items-center justify-center bg-gray-100 p-10 lg:flex">
        <Image
          src="/logo_inf_finance.png"
          alt="INF Finance Logo"
          width={250}
          height={100}
        />
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="space-y-2 text-left">
            <h1 className="text-primary text-3xl font-bold">Bem vindo</h1>
            <p className="text-muted-foreground">
              Acesse sua conta e gerencie suas finanças de forma simples e
              segura.
            </p>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="font-medium">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSenha(e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-destructive bg-destructive/10 rounded-md p-3 text-center text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold"
                variant="default"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="bg-muted mt-6 rounded-lg p-4">
              <p className="text-muted-foreground mb-2 text-center text-sm font-medium">
                Usuários de teste:
              </p>
              <div className="text-muted-foreground space-y-1 text-xs">
                <p>• joao@email.com - senha: password</p>
                <p>• maria@email.com - senha: password</p>
                <p>• pedro@email.com - senha: password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
