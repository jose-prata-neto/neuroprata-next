import type { Service } from "@/interfaces/service";
import type { IAuthRepository } from "../repository";
import type { UserLogin } from "@/server/db/schema";

export class LoginService
  implements Service<IAuthRepository, UserLogin, string | null>
{
  constructor(public repository: IAuthRepository) {}

  async execute(args: UserLogin): Promise<string | null> {
    const { email, password } = args;
    return this.repository.login(email, password);
  }
}
