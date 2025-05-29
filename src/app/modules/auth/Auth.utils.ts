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
    switch (type) {
      case ETokenType.ACCESS:
        return jwt.sign(payload, config.jwt.access_token.secret, {
          expiresIn: config.jwt.access_token.expire_in,
        });
      case ETokenType.RESET:
        return jwt.sign(payload, config.jwt.reset_token.secret, {
          expiresIn: config.jwt.reset_token.expire_in,
        });
      case ETokenType.REFRESH:
        return jwt.sign(payload, config.jwt.refresh_token.secret, {
          expiresIn: config.jwt.refresh_token.expire_in,
        });
    }
  } catch (error) {
    errorLogger.error(colors.red('🔑 Failed to create token'), error);
    throw new ServerError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create token',
    );
  }
};

/**
 * Verify a token with improved error handling
 * @param token - The token to verify
 * @param type - The type of token to verify
 * @returns The decoded token
 */
export const verifyToken = (token: string, type: ETokenType) => {
  if (!token || token.trim() === '')
    throw new ServerError(StatusCodes.UNAUTHORIZED, 'Token is missing');

  try {
    let decoded: JwtPayload;

    switch (type) {
      case ETokenType.ACCESS:
        decoded = jwt.verify(
          token,
          config.jwt.access_token.secret,
        ) as JwtPayload;
        break;

      case ETokenType.RESET:
        decoded = jwt.verify(
          token,
          config.jwt.reset_token.secret,
        ) as JwtPayload;
        break;

      case ETokenType.REFRESH:
        decoded = jwt.verify(
          token,
          config.jwt.refresh_token.secret,
        ) as JwtPayload;
        break;

      default:
        throw new ServerError(StatusCodes.UNAUTHORIZED, 'Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      errorLogger.warn(colors.yellow('🔑 Token expired'), error);

      switch (type) {
        case ETokenType.ACCESS:
          throw new ServerError(
            StatusCodes.UNAUTHORIZED,
            'Session expired. Please login again',
          );
        case ETokenType.RESET:
          throw new ServerError(
            StatusCodes.UNAUTHORIZED,
            'Password reset link expired. Please request a new one',
          );
        case ETokenType.REFRESH:
          throw new ServerError(
            StatusCodes.UNAUTHORIZED,
            'Your session expired. Please login again',
          );
      }
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorLogger.error(colors.red('🔑 Invalid token'), error);
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Invalid authentication. Please login again',
      );
    } else {
      errorLogger.error(colors.red('🔑 Failed to verify token'), error);
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Authentication failed. Please login again',
      );
    }
  }
};
