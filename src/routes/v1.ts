import { Router } from 'express';
import auth from '../app/middlewares/auth';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { AuthRoutes } from '../app/modules/auth/Auth.route';
import { ChatRoutes } from '../app/modules/chat/Chat.route';
import { UserRoutes } from '../app/modules/user/User.route';
import { StatusCodes } from 'http-status-codes';

const appRouter = Router();

/** Forward uploaded files requests */
['images'].map((filetype: string) =>
  appRouter.get(`/${filetype}/:filename`, (req, res) =>
    res.redirect(
      StatusCodes.MOVED_PERMANENTLY,
      `/${filetype}/${encodeURIComponent(req.params.filename)}`,
    ),
  ),
);

appRouter.inject([
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

export default appRouter;
