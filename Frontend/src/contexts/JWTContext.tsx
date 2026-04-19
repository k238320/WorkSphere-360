import React, { createContext, useEffect, useReducer } from 'react';

// reducer - state management
import { LOADER, LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';
import axios from 'axios';

// types
import { InitialLoginContextProps, JWTContextType } from 'types/auth';
import { toast } from 'react-toastify';
import { spinLoaderShow } from 'store/actions/spinLoader';

// constant
const initialState: InitialLoginContextProps = {
    isLoggedIn: false,
    isInitialized: false,
    user: null
};

const setSession = (serviceToken?: string | null, user?: any) => {
    if (serviceToken) {
        localStorage.setItem('token', serviceToken);
        localStorage.setItem('user', user);
        axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        delete axios.defaults.headers.common.Authorization;
    }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //
const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
    const [state, dispatch] = useReducer(accountReducer, initialState);
    const log: any = window.localStorage.getItem('user');
    const localUsers = JSON.parse(log);

    useEffect(() => {
        const init = async () => {
            try {
                const serviceToken = window.localStorage.getItem('token');
                if (serviceToken) {
                    dispatch({
                        type: LOGIN,
                        payload: {
                            isLoggedIn: true,
                            user: localUsers
                        }
                    });
                } else {
                    dispatch({
                        type: LOGOUT
                    });
                }
            } catch (err) {
                console.error(err);
                dispatch({
                    type: LOGOUT
                });
            }
        };

        init();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            dispatch(spinLoaderShow(true));
            const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/user/login`, { email, password });
            // const { data } = await axios.post('/user/login', { email, password });

            if (data.statusCode == 200) {
                window.location.href = '/dashboard/default';
                const { token } = data.data;
                setSession(token, JSON.stringify(data.data));

                dispatch({
                    type: LOGIN,
                    payload: {
                        isLoggedIn: true,
                        user: data?.data
                    }
                });
            } else {
                toast.error(data?.message);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? error?.message);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    const logout = () => {
        setSession(null);
        window.location.href = '/';
        dispatch({ type: LOGOUT, isLoggedIn: false });
    };

    const resetPassword = (email: string) => console.log(email);

    const updateProfile = () => {};

    if (state.isInitialized !== undefined && !state.isInitialized) {
        return <Loader />;
    }

    return <JWTContext.Provider value={{ ...state, login, logout, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
