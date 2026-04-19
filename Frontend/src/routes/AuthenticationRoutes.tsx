import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// login option 3 routing
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const AuthForgotPassword3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/ForgotPassword3')));
const AuthResetPassword3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/ResetPassword3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/pages/login',
            element: <AuthLogin3 />
        },

        {
            path: '/pages/forgot-password/forgot-password3',
            element: <AuthForgotPassword3 />
        },
        {
            path: '/pages/reset-password/reset-password3',
            element: <AuthResetPassword3 />
        }
    ]
};

export default AuthenticationRoutes;
