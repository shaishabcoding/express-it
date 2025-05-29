import { Types } from 'mongoose';

export type TOtp = {
  _id?: Types.ObjectId;

  user: Types.ObjectId;
  otp: string;
  exp: Date;

  createdAt?: Date;
  updatedAt?: Date;
};
