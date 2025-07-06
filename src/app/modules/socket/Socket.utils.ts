import { Socket } from 'socket.io';
import colors from 'colors';
import { errorLogger, logger } from '../../../util/logger/logger';

export const socketError = (socket: Socket, errorMessage: string) => {
  socket.emit('socketError', errorMessage);
  errorLogger.error(colors.red(errorMessage));
};

export const socketInfo = (message: string) => {
  logger.info(colors.green(message));
};
