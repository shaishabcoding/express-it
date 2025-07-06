import { Types } from 'mongoose';

export type TMessage = {
  _id?: Types.ObjectId;

  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;

  createdAt?: Date;
  updatedAt?: Date;
};
