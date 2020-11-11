import HttpException from "./http.exception";

class BadRequestException extends HttpException {
    constructor(msg: string) {
        super(400, msg);
    }
}

export default BadRequestException;