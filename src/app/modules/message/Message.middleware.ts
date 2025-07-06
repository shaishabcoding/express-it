import { Schema } from 'mongoose';
import { TMessage } from './Message.interface';
import Chat from '../chat/Chat.model';

export const MessageMiddlewares = {
  schema: (schema: Schema<TMessage>) => {
    schema.post('save', async function (doc, next) {
      try {
        await Chat.findByIdAndUpdate(doc.chat, {
          lastMessage: doc._id,
          updatedAt: doc.updatedAt,
        });
      } finally {
        next();
      }
    });
  },
};
