"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const winston_1 = require("winston");
function createLogger(loggerSettings) {
    const logger = (0, winston_1.createLogger)({
        level: loggerSettings.level,
        format: winston_1.format.combine(winston_1.format.label({
            label: 'homie-motionblinds'
        }), winston_1.format.timestamp(), winston_1.format.metadata({
            fillExcept: ['label', 'timestamp', 'level', 'message']
        }), winston_1.format.printf(({ level, message, label, timestamp, metadata }) => {
            let formatted = `${timestamp} [${label}] ${level}: ${message}`;
            if (Object.keys(metadata).length > 0) {
                const meta = JSON.stringify(metadata);
                formatted += ` ${meta}`;
            }
            return formatted;
        })),
        transports: [
            new winston_1.transports.Console()
        ]
    });
    if (loggerSettings.filename) {
        const opts = {
            filename: loggerSettings.filename
        };
        logger.info("Logging to directory.", opts);
        logger.add(new winston_1.transports.File(opts));
    }
    return logger;
}
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map