import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/http.exception';
import { LoggingService } from '../logging';

function errorMiddleware(
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction
) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  if (status >= 400 && status < 500) {
    LoggingService.warn(message, {
      status,
      correlationId: request.correlationId(),
    });
  } else {
    LoggingService.error(message, {
      status,
      correlationId: request.correlationId(),
    });
  }
  return response.status(status).json({
    status,
    message,
  });
}

export default errorMiddleware;
