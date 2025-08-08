import type { Service } from "@/interfaces/service";
import type { IUserRepository } from "../repository";
import { User } from "@/server/db/schema/user";

export class DeleteUserService
  implements Service<IUserRepository, string, boolean>
{
  constructor(public repository: IUserRepository) {
    this.repository = repository;
  }

  async execute(id: string) {
    return await this.repository.delete(id);
  }
}
