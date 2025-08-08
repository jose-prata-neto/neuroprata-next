import type { IAuthRepository } from "../repository";
import type { Service } from "@/interfaces/service";
import type { UserCreate } from "@/server/db/schema";

export class RegisterService
  implements Service<IAuthRepository, UserCreate, string | null>
{
  constructor(public repository: IAuthRepository) {}

  async execute(args: UserCreate): Promise<string | null> {
    return this.repository.register(args);
  }
}
