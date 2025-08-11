import { NextResponse } from "next/server";
import type { Patient } from "@/server/db/schema";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: { sessions: { orderBy: { date: "desc" } } },
    });
    return NextResponse.json(patients);
  } catch (error) {
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<Patient, "id" | "createdAt">;
    const { sessions, documents, ...dataToSave } = body;

    if (!dataToSave.name || !dataToSave.cpf || !dataToSave.birthDate) {
      return new NextResponse("Dados do paciente incompletos", { status: 400 });
    }

    const newPatient = await prisma.patient.create({
      data: { ...dataToSave, birthDate: new Date(dataToSave.birthDate) },
    });

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar paciente:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
