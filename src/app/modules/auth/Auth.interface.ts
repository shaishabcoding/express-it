import { Types } from 'mongoose';

export type TAuth = {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  password: string;
};
