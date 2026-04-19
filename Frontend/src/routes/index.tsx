import { lazy, useEffect, useState } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// routes
import {
    MainRoutes,
    SalesRoutes,
    ProjectManagerRoutes,
    FinanceRoutes,
    TeamLeadRoutes,
    ResourceRoutes,
    PMLead,
    HRRoutes,
    ITRoutes,
    AssociateCreativeDirector,
    HRExecutiveRoutes
} from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import Loadable from 'ui-component/Loadable';
import useAuth from 'hooks/useAuth';
import AuthGuard from 'utils/route-guard/AuthGuard';
import MainLayout from 'layout/MainLayout';

// const PagesLanding = Loadable(lazy(() => import('views/pages/landing')));

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    const { user, isLoggedIn } = useAuth();
    const [routes, setRoutes] = useState([LoginRoutes]);

    const getRoutes = () => {
        switch (user && user?.role && user?.role?.name) {
            case 'Super Admin':
                return MainRoutes;

            case 'Sales':
                return SalesRoutes;

            case 'Project Manager':
                return ProjectManagerRoutes;

            case 'Finance':
                return FinanceRoutes;

            case 'Team Lead':
                return TeamLeadRoutes;

            case 'Marketing':
                return TeamLeadRoutes;

            case 'Resource':
                return ResourceRoutes;

            case 'PM Lead':
                return PMLead;

            case 'Human Resource':
                return HRRoutes;

            case 'IT':
                return ITRoutes;

            case 'Associate Creative Director':
                return AssociateCreativeDirector;

            case 'Human Resource Operations':
                 return HRExecutiveRoutes

            default:
                return { path: '*', element: <Navigate to="/dashboard/default" />, children: [] };
        }
    };

    useEffect(() => {
        if (isLoggedIn && user && user?.role) {
            setRoutes([
                LoginRoutes,
                getRoutes(),
                AuthenticationRoutes,
                { path: '*', element: <Navigate to="/dashboard/default" />, children: [] }
            ]);
        } else {
            setRoutes([LoginRoutes, { path: '*', element: <Navigate to="/login" />, children: [] }]);
        }
        // if(isLoggedIn && userx == "ADMIN"){
        //     setRoutes([ LoginRoutes,MainRoutes,AdminRoutes,{path:"*", element:<Navigate to="/dashboard/default" />,children:[]}])
        // }
    }, [user]);

    return useRoutes(routes);
}
