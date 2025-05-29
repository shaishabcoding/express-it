/* eslint-disable no-undef, @typescript-eslint/no-var-requires */
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createDir } from '../file/createDir';
import config from '../../config';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

const myFormat = printf((info: any) => {
  const { level, message, label, timestamp } = info;
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level}: ${message}`;
});

const logDir = path.resolve(process.cwd(), 'winston');
const successLogDir = path.join(logDir, 'success');
const errorLogDir = path.join(logDir, 'error');

createDir(successLogDir);
createDir(errorLogDir);

/**
 * Logger for success messages
 */
const logger = createLogger({
  level: 'info',
  format: combine(label({ label: config.server.name }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(successLogDir, '%DATE%-success.log'),
      datePattern: 'DD-MM-YYYY-HH',
      maxSize: '20m',
      maxFiles: '1d',
    }),
  ],
});

/**
 * Logger for error messages
 */
const errorLogger = createLogger({
  level: 'error',
  format: combine(label({ label: config.server.name }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(errorLogDir, '%DATE%-error.log'),
      datePattern: 'DD-MM-YYYY-HH',
      maxSize: '20m',
      maxFiles: '1d',
    }),
  ],
});

export { errorLogger, logger };
