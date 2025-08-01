import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // <-- Importa o nosso novo cliente centralizado

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar utilizadores com Prisma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}