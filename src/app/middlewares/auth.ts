import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import User from '../modules/user/User.model';
import { verifyToken } from '../modules/auth/Auth.utils';
import catchAsync from './catchAsync';
import { EUserRole } from '../modules/user/User.enum';
import { TToken } from '../modules/auth/Auth.interface';

/**
 * Middleware to authenticate and authorize requests based on user roles
 *
 * @param roles - The roles that are allowed to access the resource
 */
const auth = (roles: EUserRole[] = [], tokenType: TToken = 'access_token') =>
  catchAsync(async (req, _, next) => {
    const token =
      req.cookies[tokenType] ||
      req.headers.authorization?.split(/Bearer /i)?.[1];

    req.user = (await User.findById(verifyToken(token, tokenType).userId))!;

    if (
      !req.user ||
      (roles[0] &&
        req.user.role !== EUserRole.ADMIN &&
        !roles.includes(req.user.role))
    )
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `Permission denied. You are not ${roles.join(' or ')}!`,
      );

    next();
  });

auth.admin = () => auth([EUserRole.ADMIN]);
auth.reset = () => auth([], 'reset_token');
auth.refresh = () => auth([], 'refresh_token');
auth.user = () => auth([EUserRole.USER, EUserRole.ADMIN]);

export default auth;
