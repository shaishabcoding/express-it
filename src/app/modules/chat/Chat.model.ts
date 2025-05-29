import { Schema, model } from 'mongoose';
import { TChat } from './Chat.interface';
import autoPopulate from 'mongoose-autopopulate';
import { ChatMiddlewares } from './Chat.middleware';

const chatSchema = new Schema<TChat>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

chatSchema.plugin(autoPopulate);

ChatMiddlewares.schema(chatSchema);

const Chat = model<TChat>('Chat', chatSchema);

export default Chat;
