import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { UserRoutes } from '../app/modules/user/User.route';

export default Router().inject([
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/profile',
    middlewares: [auth()],
    route: UserRoutes.user,
  },
  {
    path: '/chats',
    middlewares: [auth()],
    route: ChatRoutes,
  },
  {
    path: '/admin',
    middlewares: [auth.admin()],
    route: AdminRoutes,
  },
]);
