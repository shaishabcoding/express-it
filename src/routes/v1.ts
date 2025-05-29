import { Router } from 'express';
import auth from '../app/middlewares/auth';
import { TRoute } from '../types/route.types';
import AdminRoutes from '../app/modules/admin/Admin.route';
import { UserRoutes } from '../app/modules/user/User.route';
import PublicRoutes from '../app/modules/public/Public.route';

const routes: TRoute[] = [
  {
    path: '/',
    route: PublicRoutes,
  },
  {
    path: '/',
    middlewares: [auth()],
    route: UserRoutes.user,
  },
  {
    path: '/admin',
    middlewares: [auth.admin()],
    route: AdminRoutes,
  },
];

export default Router().inject(routes);
