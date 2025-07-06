import { Router } from 'express';
import { ChatControllers } from './Chat.controller';
import purifyRequest from '../../middlewares/purifyRequest';
import { QueryValidations } from '../query/Query.validation';
import User from '../user/User.model';
import Chat from './Chat.model';
import { MessageControllers } from '../message/Message.controller';

const router = Router();

router.get('/', purifyRequest(QueryValidations.list), ChatControllers.list);

router.post(
  '/:userId',
  purifyRequest(QueryValidations.exists('userId', User)),
  ChatControllers.create,
);

router.delete(
  '/:chatId/delete',
  purifyRequest(QueryValidations.exists('chatId', Chat)),
  ChatControllers.delete,
);

/** Message routes */
router.get(
  '/:chatId/messages',
  purifyRequest(QueryValidations.exists('chatId', Chat), QueryValidations.list),
  MessageControllers.list,
);

export const ChatRoutes = router;
