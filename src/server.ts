/* eslint-disable no-console */
import './util/prototype'; //! must be first
import startServer from './util/server/startServer';
import { ChatServices } from './app/modules/chat/Chat.service';

startServer().then(server => {
  ChatServices.socket(server);
});
