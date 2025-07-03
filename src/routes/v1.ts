import { Router } from 'express';
import auth from '../app/middlewares/auth';
import { TRoute } from '../types/route.types';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { ProfileRoutes } from '../app/modules/profile/Profile.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';

const routes: TRoute[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/profile',
    middlewares: [auth()],
    route: ProfileRoutes,
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
];

export default Router().inject(routes);
