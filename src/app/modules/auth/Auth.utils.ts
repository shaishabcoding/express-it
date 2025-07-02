import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../../config';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { errorLogger } from '../../../util/logger/logger';
import colors from 'colors';
import { ETokenType } from './Auth.enum';

/**
 * Create a token
 * @param payload - The payload to sign
 * @param type - The type of token to create
 * @returns The signed token
 */
export const createToken = (payload: JwtPayload, type: ETokenType) => {
  payload.tokenType = type;

  try {
    return jwt.sign(payload, config.jwt[`${type}_token`].secret, {
      expiresIn: config.jwt[`${type}_token`].expire_in,
    });
  } catch (error: any) {
    errorLogger.error(colors.red('🔑 Failed to create token'), error);
    throw new ServerError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create token ::=> ' + error.message,
    );
  }
};

/**
 * Verify a token with improved error handling
 * @param token - The token to verify
 * @param type - The type of token to verify
 * @returns The decoded token
 */
export const verifyToken = (token = '', type: ETokenType) => {
  token = token.trim();
  if (!token)
    throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not logged in!');

  try {
    return jwt.verify(token, config.jwt[`${type}_token`].secret) as JwtPayload;
  } catch (error) {
    errorLogger.error(colors.red('🔑 Failed to verify token'), error);

    if (type === ETokenType.RESET)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your password reset link has expired.',
      );
    else
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your session has expired.',
      );
  }
};
