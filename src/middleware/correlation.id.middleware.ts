import { NextFunction, Request, Response } from 'express';
import errorMiddleware from "./error.middleware";
const correlator = require('correlation-id');
export const CORRELATION_HEADER_NAME = 'x-correlation-id';

function correlationIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  request.correlationId = correlator.getId;
  correlator.withId(() => {
    const currentCorrelationId = correlator.getId();
    response.set(CORRELATION_HEADER_NAME, currentCorrelationId);
    next();
  }, request.get(CORRELATION_HEADER_NAME));
}

export default errorMiddleware;