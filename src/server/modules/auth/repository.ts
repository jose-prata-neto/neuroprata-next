import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db } from '@/server/db';
import { type UserCreate, userTable } from '@/server/db/schema';

export interface IAuthRepository {
  login(email: string, password: string): Promise<string | null>;
  register(data: UserCreate): Promise<string | null>;
}

export class AuthRepository implements IAuthRepository {
  private readonly db: PostgresJsDatabase;

  constructor(inputDb: PostgresJsDatabase) {
    this.db = inputDb;
  }

  async register(data: UserCreate) {
    const existingUser = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, data.email))
      .then((r) => r[0]);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');

    const hashedPassword = crypto
      .createHash('sha256')
      .update(data.password + salt)
      .digest('hex');

    const res = await this.db
      .insert(userTable)
      .values({
        ...data,
        password: hashedPassword,
        salt,
      })
      .returning();

    return res[0].id;
  }

  async login(email: string, password: string) {
    const user = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .then((r) => r[0]);

    if (!user) {
      return null;
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password + user.salt)
      .digest('hex');

    if (hashedPassword !== user.password) {
      return null;
    }

    return user.id;
  }
}

export const authRepository = new AuthRepository(db);
