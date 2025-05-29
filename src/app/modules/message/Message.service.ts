import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import Chat from '../chat/Chat.model';
import { TList } from '../query/Query.interface';
import { TMessage } from './Message.interface';
import Message from './Message.model';

export const MessageServices = {
  async create(messageData: TMessage) {
    return Message.create(messageData);
  },

  async list({ page, limit, user, chat }: TList & any) {
    const hasChat = await Chat.exists({
      _id: chat,
      users: { $all: [user] },
    });

    if (!hasChat)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Chat not found!');

    const messages = await Message.find({
      chat,
    })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({
      chat,
    });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      messages,
    };
  },
};
