'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const resetPasswordSchema = z.object({
  email: z.email('Por favor, insira um endereço de email válido').toLowerCase(),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (_data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado'
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
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-600 text-sm">
            <p className="mb-2 font-medium">Email de recuperação enviado!</p>
            <p>
              Enviamos um link de recuperação de senha para seu email. Clique no
              link para redefinir sua senha. O link expira em 1 hora.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-1">
          <p className="mx-auto text-muted-foreground text-sm">
            Não recebeu o email?{' '}
            <button
              className="text-primary hover:underline"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
              type="button"
            >
              Tentar novamente
            </button>
          </p>
          <p className="mx-auto text-muted-foreground text-sm">
            Lembrou da senha?{' '}
            <Link className="text-primary hover:underline" href="/auth">
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
                      placeholder="Digite seu email cadastrado"
                      type="email"
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

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col gap-1">
        <p className="mx-auto text-muted-foreground text-sm">
          Lembrou da senha?{' '}
          <Link className="text-primary hover:underline" href="/auth/login">
            Fazer login
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
