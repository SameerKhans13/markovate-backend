// utils/logger.js
import winston from 'winston';
import 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.data ? JSON.stringify(info.data) : ''}`
  )
);

const transports = [
  // Console Transport
  new winston.transports.Console({
    format: format
  }),

  // Error Log File Transport
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),

  // Combined Log File Transport
  new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Custom logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports
});

// Additional logging methods
logger.logRequest = (req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
    data: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip
    }
  });
  next();
};

logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  logger.error('Error occurred:', { data: errorLog });
};

logger.logDatabaseQuery = (query, params) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database Query:', {
      data: {
        query,
        params
      }
    });
  }
};

logger.logAPIResponse = (req, res, data) => {
  logger.info(`API Response sent for ${req.method} ${req.originalUrl}`, {
    data: {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: res.get('X-Response-Time'),
      responseData: process.env.NODE_ENV === 'development' ? data : undefined
    }
  });
};

// Prevent errors from crashing the process
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', { data: error });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { data: error });
  process.exit(1);
});

export default logger;