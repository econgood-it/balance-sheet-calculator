import { NextFunction, Request, Response } from 'express';
const correlator = require('correlation-id');
export const CORRELATION_HEADER_NAME = 'x-correlation-id';

function correlationIdMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  request.correlationId = correlator.getId;
  const idProvidedByUser = request.get(CORRELATION_HEADER_NAME);
  if (idProvidedByUser) {
    correlator.withId(idProvidedByUser, () => {
      response.set(CORRELATION_HEADER_NAME, correlator.getId());
      next();
    });
  } else {
    correlator.withId(() => {
      response.set(CORRELATION_HEADER_NAME, correlator.getId());
      next();
    });
  }
}

export default correlationIdMiddleware;
