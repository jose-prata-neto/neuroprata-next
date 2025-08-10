import { NextResponse } from 'next/server';

import { db } from '@/server/db';
import { userTable } from '@/server/db/schema';

export async function GET() {
  try {
    const users = await db.select().from(userTable);
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
