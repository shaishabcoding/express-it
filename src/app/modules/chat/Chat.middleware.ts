import { Schema } from 'mongoose';
import { TChat } from './Chat.interface';
import Message from '../message/Message.model';

export const ChatMiddlewares = {
  schema: (schema: Schema<TChat>) => {
    schema.post('findOneAndDelete', async function (doc, next) {
      try {
        await Message.deleteMany({ chat: doc._id });
      } finally {
        next();
      }
    });
  },
};
