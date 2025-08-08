import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import prisma from "../../../../src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, duration, sessionType, notes, patientId } = body;

    if (!date || !duration || !sessionType || !notes || !patientId) {
      return new NextResponse("Dados da sessão incompletos", { status: 400 });
    }

    const newSession = await prisma.session.create({
      data: {
        date: new Date(date),
        duration,
        sessionType,
        notes,
        patientId,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
