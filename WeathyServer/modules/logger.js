const { createLogger, format, transports } = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

const appRoot = require('app-root-path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';
const logDir = `${appRoot}/logs`;

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const { combine, timestamp, label, printf } = format;
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        label({
            label: 'Weathy'
        }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat
    ),
    transports: [
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.log`,
            maxFiles: 30,
            zippedArchive: true
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true
        })
    ]
});

if (env !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(format.colorize(), format.simple())
        })
    );
}
module.exports = logger;
