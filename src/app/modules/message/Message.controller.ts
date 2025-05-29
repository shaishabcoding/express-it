import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { MessageServices } from './Message.service';

export const MessageControllers = {
  list: catchAsync(async ({ query, params, user }, res) => {
    const { messages, meta } = await MessageServices.list({
      ...query,
      chat: params.chatId,
      user: user!._id!,
    });

    serveResponse(res, {
      message: 'Messages retrieved successfully!',
      meta,
      data: messages,
    });
  }),
};
