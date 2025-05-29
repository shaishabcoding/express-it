import { StatusCodes } from 'http-status-codes';
import { TErrorHandler } from '../types/errors.types';

const handleMongooseDuplicateError = (error: any): TErrorHandler => {
  const field = Object.keys(error.keyPattern)[0];
  return {
    statusCode: StatusCodes.CONFLICT,
    message: 'Duplicate Error',
    errorMessages: [
      {
        path: field,
        message: `${field} already exists`,
      },
    ],
  };
};

export default handleMongooseDuplicateError;
