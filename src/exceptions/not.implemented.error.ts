export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`Feature ${feature} not implemented yet`);
  }
}
