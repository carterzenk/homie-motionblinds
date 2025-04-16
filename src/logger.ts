import {createLogger as createWinstonLogger, format, transports} from 'winston';

type LeveledLogMethod = (message: string, ...meta: any[]) => void;

export interface Logger {
    debug: LeveledLogMethod;
    info: LeveledLogMethod;
    notice: LeveledLogMethod;
    warn: LeveledLogMethod;
    error: LeveledLogMethod;
}

export function createLogger(loggerSettings): Logger {
    const logger = createWinstonLogger({
        level: loggerSettings.level,
        format: format.combine(
            format.label({
                label: 'homie-motionblinds'
            }),
            format.timestamp(),
            format.metadata({
                fillExcept: ['label', 'timestamp', 'level', 'message']
            }),
            format.printf(({ level, message, label, timestamp, metadata }) => {
                let formatted = `${timestamp} [${label}] ${level}: ${message}`;
    
                if (Object.keys(metadata as any).length > 0) {
                    const meta = JSON.stringify(metadata);
                    formatted += ` ${meta}`;
                }
                
                return formatted;
            })
        ),
        transports: [
            new transports.Console()
        ]
    });
    
    if (loggerSettings.filename) {
        const opts = {
            filename: loggerSettings.filename
        };
    
        logger.info("Logging to directory.", opts);
        logger.add(new transports.File(opts));
    }

    return logger;
}
