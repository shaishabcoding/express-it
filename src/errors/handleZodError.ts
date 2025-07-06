import { ZodError } from 'zod';
import { TErrorMessage } from '../types/errors.types';
import { StatusCodes } from 'http-status-codes';

const handleZodError = (error: ZodError) => {
  const errorMessages: TErrorMessage[] = error.errors.map(el => ({
    path: el.path[el.path.length - 1],
    message: el.message,
  }));

  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Request validation error',
    errorMessages,
  };
};

export default handleZodError;
