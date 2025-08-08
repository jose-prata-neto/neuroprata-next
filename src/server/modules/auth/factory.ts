import { AuthRepository, IAuthRepository } from "./repository";
import { RegisterService, LoginService } from "./services";
import { db } from "@/server/db";

function authFactory<T>(Service: new (repository: IAuthRepository) => T) {
  return new Service(new AuthRepository(db));
}

const registerService = authFactory(RegisterService);
const loginService = authFactory(LoginService);

const authServices = {
  register: registerService,
  login: loginService,
};

export { authServices };
