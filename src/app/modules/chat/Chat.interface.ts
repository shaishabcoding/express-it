import { Types } from 'mongoose';

export type TChat = {
  _id?: Types.ObjectId;

  users: Types.ObjectId[];
  lastMessage?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
};
