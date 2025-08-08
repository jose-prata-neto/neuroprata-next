import type { Service } from "@/interfaces/service";
import type { IUserRepository } from "../repository";
import { User } from "@/server/db/schema/user";

export class FindUserByIDService
  implements Service<IUserRepository, string, User | null>
{
  constructor(public repository: IUserRepository) {
    this.repository = repository;
  }

  async execute(id: string) {
    return await this.repository.findById(id);
  }
}
