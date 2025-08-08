import {
  userTable,
  type User,
  type UserCreate,
  type UserUpdate,
} from "@/server/db/schema/user";
import { db } from "@/server/db/index";

import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

interface IUserRepository {
  findAll: () => Promise<User[]>;
  findById: (id: string) => Promise<User | null>;
  update: (id: string, data: UserUpdate) => Promise<User | null>;
  delete: (id: string) => Promise<boolean>;
}

class UserRepository implements IUserRepository {
  private readonly db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

  async findAll() {
    return await this.db.select().from(userTable);
  }

  async findById(id: string) {
    return await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .then((r) => r[0]);
  }

  async update(id: string, data: UserUpdate) {
    const result = await this.db
      .update(userTable)
      .set(data)
      .where(eq(userTable.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string) {
    const result = await this.db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();

    return result[0] !== undefined;
  }
}

export const userRepository = new UserRepository(db);
