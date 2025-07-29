import { NextResponse } from 'next/server';
import type { User } from '@/types';

let users: User[] = [
  {
    id: 'admin-user-id',
    name: 'Admin',
    email: 'admin@neuroprata.com',
    passwordHash: 'hashed_admin123',
    role: 'admin',
  }
];

// Esta função lida com requisições GET para /api/users
export async function GET() {
  // O NOSSO "ESPIÃO" ESTÁ AQUI!
  console.log('--- API GET /api/users FOI CHAMADA ---');
  console.log('Utilizadores na memória da API:', users);
  console.log('------------------------------------');

  return NextResponse.json(users);
}

// Esta função lida com requisições POST para /api/users
export async function POST(request: Request) {
  try {
    const body = await request.json();
    users = body;
    console.log("Utilizadores atualizados na API via POST:", users);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao salvar utilizadores:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
} 