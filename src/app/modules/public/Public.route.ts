import { Router } from 'express';
import { TRoute } from '../../../types/route.types';
import { AuthRoutes } from '../auth/Auth.route';

const routes: TRoute[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
];

export default Router().inject(routes);
