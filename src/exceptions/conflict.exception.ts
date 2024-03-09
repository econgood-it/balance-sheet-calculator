import HttpException from './http.exception';

export class ConflictException extends HttpException {
  constructor(msg: string) {
    super(409, msg);
  }
}
