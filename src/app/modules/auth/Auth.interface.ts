import { Types } from 'mongoose';
import config from '../../../config';

export type TAuth = {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  password: string;
};

export type TToken = keyof typeof config.jwt;
