'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type LoginFormData, loginSchema } from '@/models/auth-form';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const success = searchParams.get('success');
  const successMessage =
    success === 'registration' ? 'Conta criada com sucesso! Faça login.' : null;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha no login');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Por favor, insira suas credenciais para fazer login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu email"
                      type="email"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite sua senha"
                      type="password"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Fazendo login...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-1">
        <p className="mx-auto text-muted-foreground text-sm">
          Esqueceu sua senha?{' '}
          <Link
            className="text-primary hover:underline"
            href="/auth/reset-password"
          >
            Recuperar aqui
          </Link>
        </p>
        <p className="mx-auto text-muted-foreground text-sm">
          Não tem uma conta?{' '}
          <Link className="text-primary hover:underline" href="/auth/register">
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
