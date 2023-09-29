import * as origWinston from 'winston';

export class LoggingService {
  public static readonly logger: origWinston.Logger =
    LoggingService.createLogger();

  private static createLogger(): origWinston.Logger {
    const logDir = 'logs';
    return origWinston.createLogger({
      level: 'info',
      format: origWinston.format.combine(
        origWinston.format.timestamp(),
        origWinston.format.json(),
        origWinston.format.errors({ stack: true })
      ),
      defaultMeta: { service: 'balance-sheet-api-service' },
      transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new origWinston.transports.Console(),
        new origWinston.transports.File({
          dirname: logDir,
          filename: 'error.log',
          level: 'error',
        }),
        new origWinston.transports.File({
          dirname: logDir,
          filename: 'warn.log',
          level: 'warn',
        }),
        new origWinston.transports.File({
          dirname: logDir,
          filename: 'combined.log',
        }),
      ],
    });
  }

  public static info(
    msg: string,
    meta?: any,
    callback?: origWinston.LogCallback
  ): void {
    this.logger.info(msg, meta, callback);
  }

  public static warn(
    msg: string,
    meta?: any,
    callback?: origWinston.LogCallback
  ): void {
    this.logger.warn(msg, meta, callback);
  }

  public static error(
    msg: string,
    meta?: any,
    callback?: origWinston.LogCallback
  ): void {
    this.logger.error(msg, meta, callback);
  }
}
