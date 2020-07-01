import HttpException from "./HttpException";

class InternalServerException extends HttpException {
    constructor(msg: string) {
        super(500, msg);
    }
}

export default InternalServerException;