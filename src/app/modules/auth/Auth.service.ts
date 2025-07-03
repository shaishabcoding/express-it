import User from '../user/User.model';
import bcrypt from 'bcryptjs';
import { createToken, verifyPassword, verifyToken } from './Auth.utils';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { Types } from 'mongoose';
import config from '../../../config';
import { Response } from 'express';
import { userExcludeFields } from '../user/User.constant';
import { ETokenType } from './Auth.enum';
import Auth from './Auth.model';

export const AuthServices = {
  async login(userId: Types.ObjectId, password: string) {
    const auth = await Auth.findOne({ user: userId });

    if (!(await bcrypt.compare(password, auth!.password)))
      throw new ServerError(StatusCodes.UNAUTHORIZED, 'You are not authorized');

    return this.retrieveToken(userId);
  },

  async setRefreshToken(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      secure: !config.server.isDevelopment,
      maxAge: verifyToken(refreshToken, ETokenType.REFRESH).exp! * 1000,
      httpOnly: true,
    });
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
    const accessToken = createToken({ userId }, ETokenType.ACCESS);
    const refreshToken = createToken({ userId }, ETokenType.REFRESH);

    const userData = await User.findById(userId)
      .select('-' + userExcludeFields.join(' -'))
      .lean();

    return { accessToken, user: userData, refreshToken };
  },
};
