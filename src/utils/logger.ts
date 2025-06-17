import winston from 'winston';
import { format } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize } = format;

export class Logger {
  private logger: winston.Logger;
  private context: string;
  private static logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

  constructor(context: string) {
    this.context = context;
    
    // Ensure log directory exists
    require('fs').mkdirSync(Logger.logDir, { recursive: true });

    const logFormat = printf(({ level, message, timestamp, ...meta }) => {
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta, null, 2)}` : '';
      return `${timestamp} [${level.toUpperCase()}] ${this.context}: ${message}${metaString}`;
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: combine(
            colorize({ all: true }),
            logFormat
          ),
        }),
        // Daily rotate file transport for all logs
        new winston.transports.DailyRotateFile({
          filename: path.join(Logger.logDir, 'jibby-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        // Error log file
        new winston.transports.File({
          filename: path.join(Logger.logDir, 'error.log'),
          level: 'error',
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(Logger.logDir, 'exceptions.log'),
        }),
      ],
      exitOnError: false,
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      this.error('Unhandled Rejection:', reason);
    });
  }

  public error(message: string, ...meta: any[]): void {
    this.log('error', message, ...meta);
  }

  public warn(message: string, ...meta: any[]): void {
    this.log('warn', message, ...meta);
  }

  public info(message: string, ...meta: any[]): void {
    this.log('info', message, ...meta);
  }

  public http(message: string, ...meta: any[]): void {
    this.log('http', message, ...meta);
  }

  public verbose(message: string, ...meta: any[]): void {
    this.log('verbose', message, ...meta);
  }

  public debug(message: string, ...meta: any[]): void {
    this.log('debug', message, ...meta);
  }

  public silly(message: string, ...meta: any[]): void {
    this.log('silly', message, ...meta);
  }

  private log(level: string, message: string, ...meta: any[]): void {
    this.logger.log(level, message, ...meta);
  }

  public static setLogDirectory(dir: string): void {
    Logger.logDir = dir;
  }
}
