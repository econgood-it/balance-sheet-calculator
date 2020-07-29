import HttpException from "./HttpException";

class BadRequestException extends HttpException {
    constructor(msg: string) {
        super(400, msg);
    }
}

export default BadRequestException;