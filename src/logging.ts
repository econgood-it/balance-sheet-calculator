import * as origWinston from 'winston';

export class LoggingService {

    public static readonly logger: origWinston.Logger = LoggingService.createLogger();
    private static createLogger(): origWinston.Logger {
        return origWinston.createLogger({
            level: 'info',
            format: origWinston.format.json(),
            defaultMeta: { service: 'balance-sheet-api-service' },
            transports: [
                //
                // - Write all logs with level `error` and below to `error.log`
                // - Write all logs with level `info` and below to `combined.log`
                //
                new origWinston.transports.Console(),
                new origWinston.transports.File({ filename: 'error.log', level: 'error' }),
                new origWinston.transports.File({ filename: 'combined.log' }),
            ],
        });

    }
    public static info(msg: string): void {
        this.logger.info(msg);
    }
    public static warn(msg: string): void {
        this.logger.warn(msg);
    }

    public static error(msg: string, callback?: origWinston.LogCallback): void {
        this.logger.error(msg, callback);
    }
}
