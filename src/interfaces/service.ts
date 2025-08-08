export interface Service<Repository, Input = void, Output = void> {
  repository: Repository;
  execute(args: Input): Promise<Output>;
}
