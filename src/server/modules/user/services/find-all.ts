import type { Service } from "@/interfaces/service";
import type { IUserRepository } from "../repository";
import { User } from "@/server/db/schema/user";

export class FindAllUsersService
  implements Service<IUserRepository, void, User[]>
{
  constructor(public repository: IUserRepository) {
    this.repository = repository;
  }

  async execute() {
    return await this.repository.findAll();
  }
}
