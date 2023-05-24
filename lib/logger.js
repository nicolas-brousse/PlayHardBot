import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.colorize(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  )
})

export { logger }