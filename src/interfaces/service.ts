export abstract class Service<Repository, Input = void, Output = void> {
  protected repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  abstract execute(args: Input): Promise<Output>;
}
