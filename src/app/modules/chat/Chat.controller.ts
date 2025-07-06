import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ChatServices } from './Chat.service';

export const ChatControllers = {
  create: catchAsync(async ({ user, params }, res) => {
    const data = await ChatServices.create([user._id, params.userId]);

    serveResponse(res, {
      message: 'Chat resolved successfully!',
      data,
    });
  }),

  list: catchAsync(async ({ query, user }, res) => {
    const { chats, meta } = await ChatServices.list(query, user._id);

    serveResponse(res, {
      message: 'Chats retrieved successfully!',
      meta,
      data: chats,
    });
  }),

  delete: catchAsync(async ({ user, params }, res) => {
    const message = await ChatServices.delete(params.chatId, user._id);

    if (!message)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to delete this chat.',
      );

    serveResponse(res, {
      message: 'Chat deleted successfully!',
    });
  }),
};
