import HttpException from "./http.exception";

class NotFoundException extends HttpException {
    constructor(msg: string) {
        super(404, msg);
    }
}

export default NotFoundException;