import HttpException from './http.exception';

class ForbiddenException extends HttpException {
  constructor(msg: string) {
    super(403, msg);
  }
}

export default ForbiddenException;
