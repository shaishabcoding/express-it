/* eslint-disable no-console */
import { Types } from 'mongoose';
import Chat from './Chat.model';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { TList } from '../query/Query.interface';
import http from 'http';
import config from '../../../config';
import Message from '../message/Message.model';
import { Server } from 'socket.io';

export let io: Server | null;

export const ChatServices = {
  async create(users: Types.ObjectId[]) {
    if (users[0].equals(users[1]))
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Invalid chat users');

    const chat = await Chat.findOne({
      users: { $all: users },
    });

    return chat || Chat.create({ users });
  },

  async list({ page, limit }: TList, userId: Types.ObjectId) {
    const chats = await Chat.aggregate([
      { $match: { users: userId } },
      {
        $addFields: {
          opponentId: {
            $first: {
              $filter: {
                input: '$users',
                as: 'u',
                cond: { $ne: ['$$u', userId] },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'opponentId',
          foreignField: '_id',
          as: 'opponent',
        },
      },
      { $unwind: '$opponent' },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { content: 1, updatedAt: 1, sender: 1 } },
          ],
          as: 'lastMessage',
        },
      },
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: '$opponent._id',
          name: '$opponent.name',
          avatar: '$opponent.avatar',
          message: {
            $cond: {
              if: { $eq: ['$lastMessage.sender', userId] },
              then: { $concat: ['(You) ', '$lastMessage.content'] },
              else: '$lastMessage.content',
            },
          },
          updatedAt: '$lastMessage.updatedAt',
          chatCreatedAt: '$createdAt',
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const total = await Chat.countDocuments({ users: userId });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      chats,
    };
  },

  async delete(chatId: Types.ObjectId, userId: Types.ObjectId) {
    return Chat.findOneAndDelete({
      _id: chatId,
      users: { $all: [userId] },
    });
  },

  async socket(server: http.Server) {
    if (!io) {
      io = new Server(server, {
        cors: { origin: config.server.allowed_origins },
      });
      console.log('🔑 Socket server initialized');
    }

    io.on('connection', socket => {
      console.log('👤 User connected');

      socket.on('disconnect', () => {
        console.log('👤 User disconnected');
      });

      socket.on('error', err => {
        console.log(err);
        socket.disconnect();
      });

      socket.on('sendMessage', async ({ roomId, sender, message }: any) => {
        try {
          const newMessage = await Message.create({
            chat: roomId,
            sender,
            content: message,
          });
          io?.emit(`messageReceived:${roomId}`, newMessage);
          console.log(newMessage);
          const chat = await Chat.findById(roomId);

          chat?.users.forEach(user => {
            io?.emit(`inboxUpdated:${user}`, newMessage);
          });
        } catch (error) {
          console.log(error);
        }
      });
    });
  },
};
