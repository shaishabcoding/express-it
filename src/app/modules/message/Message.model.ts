import { Schema, model } from 'mongoose';
import { TMessage } from './Message.interface';
import { MessageMiddlewares } from './Message.middleware';

const messageSchema = new Schema<TMessage>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

messageSchema.plugin(MessageMiddlewares.schema);

const Message = model<TMessage>('Message', messageSchema);

export default Message;
