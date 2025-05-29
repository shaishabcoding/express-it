import Chat from './Chat.model';
import Message from '../message/Message.model';
import { TSocketHandler } from '../socket/Socket.interface';
import { Server } from 'socket.io';
import { socketError, socketInfo } from '../socket/Socket.utils';
import { json } from '../../../util/transform/json';

const chatSocket: TSocketHandler = (io, socket) => {
  const { user } = socket.data;

  socket.on('join', async (payload: any) => {
    const { chatId } = json(payload) as { chatId: string };

    if (!chatId)
      return socketError(
        socket,
        `❌ Invalid join payload from: ${socket.id} chatId: ${chatId}`,
      );

    try {
      const chat = await Chat.findOne({
        _id: chatId.oid,
        users: { $all: [user._id.oid] },
      });

      if (!chat) return socketError(socket, `❌ Chat room ${chatId} not found`);

      socket.join(chatId);
      socketInfo(`${user.name ?? 'Unknown'} join to chat: ${chatId}`);
    } catch (error: any) {
      socketError(socket, error.message);
    }
  });

  socket.on('sendMessage', async (payload: any) => {
    const { content, chatId } = json(payload) as {
      content: string;
      chatId: string;
    };

    if (!content || !chatId)
      return socketError(
        socket,
        `❌ Invalid message payload from: ${socket.id} content: ${content}, chatId: ${chatId}`,
      );

    try {
      const chat = await Chat.findOne({
        _id: chatId.oid,
        users: { $all: [user._id.oid] },
      }).lean();

      if (!chat) return socketError(socket, `❌ Chat room ${chatId} not found`);

      const message = await Message.create({
        chat: chatId,
        content,
        sender: user._id,
      });

      updateInbox(io, chat.users);

      io.to(chatId).emit('messageReceived', message);
      io.emit(`messageReceived:${chatId}`, message);

      socketInfo(
        `✅ Message sent successfully from: ${user.name ?? 'Unknown'} to chat: ${chatId}`,
      );
    } catch (error: any) {
      socketError(socket, `❌ Error sending message: ${error.message}`);
    }
  });

  socket.on('deleteMessage', async (payload: any) => {
    const { messageId } = json(payload) as { messageId: string };

    if (!messageId)
      return socketError(
        socket,
        `❌ Invalid delete request from: ${socket.id} messageId: ${messageId}`,
      );

    try {
      const message = await Message.findOne({
        _id: messageId.oid,
        sender: user._id.oid,
      }).populate('chat', 'users');

      if (!message)
        return socketError(socket, `❌ Message ${messageId} not found`);

      await Message.findByIdAndDelete(messageId);

      io.to(message.chat._id.toString()).emit('messageDeleted', {
        messageId,
      });

      io.emit(`messageDeleted:${message.chat._id}`, {
        messageId,
      });

      updateInbox(io, (message.chat as any).users);

      socketInfo(`✅ Message ${messageId} deleted successfully`);
    } catch (error: any) {
      socketError(socket, `❌ Error deleting message: ${error.message}`);
    }
  });
};

const updateInbox = (io: Server, users: any[]) => {
  users.map(user => io.to(user.toString()).emit('inboxUpdated'));
};

export default chatSocket;
