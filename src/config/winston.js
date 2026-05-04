import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stacke: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'acquisitions_api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
      ),
    })
  );
}
export default logger;
