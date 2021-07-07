export class NoAccessError extends Error {
  constructor() {
    super('User has no access permission');
  }
}
