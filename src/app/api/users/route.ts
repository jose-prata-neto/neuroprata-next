import { NextResponse } from "next/server";

import { db } from "@/server/db";
import { userTable } from "@/server/db/schema";

export async function GET() {
  try {
    const users = await db.select().from(userTable);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar utilizadores com Prisma:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
