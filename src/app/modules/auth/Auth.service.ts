import User from '../user/User.model';
import bcrypt from 'bcryptjs';
import { createToken, verifyPassword, verifyToken } from './Auth.utils';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { Types } from 'mongoose';
import config from '../../../config';
import { Response } from 'express';
import { ETokenType } from './Auth.enum';
import Auth from './Auth.model';
import ms from 'ms';

export const AuthServices = {
  async login(userId: Types.ObjectId, password: string) {
    const auth = await Auth.findOne({ user: userId });

    if (!(await bcrypt.compare(password, auth!.password)))
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not authorized');

    return this.retrieveToken(userId);
  },

  setTokens(res: Response, tokens: Record<keyof typeof config.jwt, string>) {
    Object.entries(tokens).forEach(([key, value]) =>
      res.cookie(key, value, {
        secure: !config.server.isDevelopment,
        maxAge: ms(config.jwt[key as keyof typeof config.jwt].expire_in),
        httpOnly: true,
      }),
    );
  },

  async resetPassword(userId: Types.ObjectId, password: string) {
    return Auth.updateOne({ user: userId }, { password });
  },

  async changePassword(userId: Types.ObjectId, password: string) {
    const auth = (await Auth.findOne({ user: userId }))!;

    if (await verifyPassword(password, auth.password))
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your credentials are incorrect.',
      );

    auth.password = password;

    return auth.save();
  },

  async refreshToken(refreshToken: string) {
    const token = refreshToken.split(' ')[0];

    if (!token)
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not logged in!');

    const { userId } = verifyToken(token, ETokenType.REFRESH);

    const user = await User.findById(userId).select('_id');

    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, 'User not found!');

    return this.retrieveToken(user._id);
  },

  async retrieveToken(userId: Types.ObjectId) {
    return {
      access_token: createToken({ userId }, ETokenType.ACCESS),
      refresh_token: createToken({ userId }, ETokenType.REFRESH),
      user: await User.findById(userId).lean(),
    };
  },
};
