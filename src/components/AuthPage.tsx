import React, { useState } from "react";
import Button from "./Button";
import type { RegisterData } from "@/interfaces";
import { NeuronIcon } from "@/constants";

interface AuthPageProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  onRegister: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"psychologist" | "staff">("psychologist");
  const [identifier, setIdentifier] = useState(""); // Holds CRP or CPF
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    let result;
    if (isLoginView) {
      result = await onLogin(email, password);
    } else {
      if (!name || !identifier) {
        setError(
          `Nome e ${role === "psychologist" ? "CRP" : "CPF"} são obrigatórios.`
        );
        setIsLoading(false);
        return;
      }
      result = await onRegister({ name, email, password, role, identifier });
    }

    if (result && !result.success) {
      setError(result.error || "Ocorreu um erro.");
    }
    setIsLoading(false);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
    setIdentifier("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <NeuronIcon className="mx-auto h-12 w-12 text-slate-800" />
          <h1 className="mt-3 text-3xl font-bold text-slate-800">NeuroPrata</h1>
          <p className="mt-1 text-slate-500">
            {isLoginView ? "Bem-vindo(a) de volta!" : "Crie sua conta"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {!isLoginView && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Tipo de Conta
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setRole("psychologist")}
                    className={`px-3 py-1 text-sm font-semibold rounded ${
                      role === "psychologist"
                        ? "bg-white shadow text-slate-800"
                        : "text-slate-600"
                    }`}
                  >
                    Psicólogo(a)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("staff")}
                    className={`px-3 py-1 text-sm font-semibold rounded ${
                      role === "staff"
                        ? "bg-white shadow text-slate-800"
                        : "text-slate-600"
                    }`}
                  >
                    Funcionário(a)
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="name" className="sr-only">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                  placeholder="Nome Completo"
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
              placeholder="Senha"
            />
          </div>
          {!isLoginView && (
            <div>
              <label htmlFor="identifier" className="sr-only">
                {role === "psychologist" ? "CRP" : "CPF"}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                placeholder={
                  role === "psychologist"
                    ? "CRP (ex: 06/123456)"
                    : "CPF (somente números)"
                }
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading
                ? "Processando..."
                : isLoginView
                ? "Entrar"
                : "Registrar"}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {isLoginView ? "Não tem uma conta?" : "Já tem uma conta?"}
          <button
            onClick={toggleView}
            className="ml-1 font-medium text-slate-600 hover:text-slate-800"
          >
            {isLoginView ? "Registre-se" : "Faça login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
