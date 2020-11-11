import HttpException from "./HttpException";
import {LoggingService} from "../logging";

class InternalServerException extends HttpException {
    constructor(msg: string) {
        LoggingService.error(msg);
        super(500, msg);
    }
}

export default InternalServerException;