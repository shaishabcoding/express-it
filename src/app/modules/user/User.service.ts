/* eslint-disable no-unused-vars */
import { TUser } from './User.interface';
import User from './User.model';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import { RootFilterQuery, Types } from 'mongoose';
import { TList } from '../query/Query.interface';
import Auth from '../auth/Auth.model';
import { TAuth } from '../auth/Auth.interface';
import { useSession } from '../../../util/db/session';
import { Request } from 'express';
import { userSearchableFields as searchFields } from './User.constant';
import { deleteImage } from '../../middlewares/capture';

export const UserServices = {
  async create(userData: Partial<TUser & TAuth>) {
    return useSession(async session => {
      let user = await User.findOne({ email: userData.email }).session(session);

      if (user)
        throw new ServerError(
          StatusCodes.CONFLICT,
          `${user.role.toCapitalize()} already exists!`,
        );

      [user] = await User.create([userData], { session });

      await Auth.create(
        [
          {
            user: user._id,
            password: userData.password,
          },
        ],
        { session },
      );

      return user;
    });
  },

  async edit({ user, body }: Request) {
    if (body.avatar && user.avatar) await deleteImage(user.avatar);

    Object.assign(user, body);

    return user.save();
  },

  async list({ page, limit, search }: TList) {
    const filter: RootFilterQuery<TUser> = {};

    if (search)
      filter.$or = searchFields.map(field => ({
        [field]: {
          $regex: search,
          $options: 'i',
        },
      }));

    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      users,
    };
  },

  async delete(userId: Types.ObjectId) {
    return useSession(async session => {
      const user = await User.findByIdAndDelete(userId).session(session);
      await Auth.findOneAndDelete({ user: userId }).session(session);

      if (user?.avatar) await deleteImage(user.avatar);

      return user;
    });
  },
};
