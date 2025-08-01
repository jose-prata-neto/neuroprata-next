import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

// A SUA FUNÇÃO EXISTENTE (mantida como está)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`--- API DELETE /api/sessions/${id} FOI CHAMADA ---`);
    console.log(`A tentar apagar a sessão com ID: ${id}`);
    
    await prisma.session.delete({
      where: { id: id },
    });

    console.log(`SUCESSO: Sessão com ID: ${id} foi apagada.`);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`!!! ERRO ao apagar sessão:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NextResponse(
          JSON.stringify({ message: "Sessão não encontrada para apagar." }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new NextResponse(
      JSON.stringify({ message: "Erro interno do servidor." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// NOVA FUNÇÃO ADICIONADA: Lida com requisições PATCH para /api/sessions/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus } = body;

    // Validação: garante que o estado do pagamento é válido
    if (paymentStatus !== 'paid' && paymentStatus !== 'pending') {
      return new NextResponse(
        JSON.stringify({ message: "Estado de pagamento inválido. Use 'paid' ou 'pending'." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usa o Prisma para ATUALIZAR a sessão com o ID correspondente
    const updatedSession = await prisma.session.update({
      where: { id: id },
      data: { paymentStatus: paymentStatus } as Prisma.SessionUpdateInput,
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return new NextResponse(JSON.stringify({ message: "Sessão não encontrada para atualizar." }), { status: 404 });
    }
    return new NextResponse(JSON.stringify({ message: "Erro interno do servidor." }), { status: 500 });
  }
}