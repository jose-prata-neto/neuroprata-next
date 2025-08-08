"use client";

import { Button } from "@/components/ui/button";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("Por favor, insira um endereço de email válido")
    .toLowerCase(),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro inesperado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Email Enviado</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada para instruções de recuperação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium mb-2">Email de recuperação enviado!</p>
            <p>
              Enviamos um link de recuperação de senha para seu email. Clique no
              link para redefinir sua senha. O link expira em 1 hora.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-1">
          <p className="text-sm text-muted-foreground mx-auto">
            Não recebeu o email?{" "}
            <button
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </p>
          <p className="text-sm text-muted-foreground mx-auto">
            Lembrou da senha?{" "}
            <Link href="/auth" className="text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber instruções de recuperação de senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Digite seu email cadastrado"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enviaremos um link de recuperação para este email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-1">
        <p className="text-sm text-muted-foreground mx-auto">
          Lembrou da senha?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Fazer login
          </Link>
        </p>
        <p className="text-sm text-muted-foreground mx-auto">
          Não tem uma conta?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
