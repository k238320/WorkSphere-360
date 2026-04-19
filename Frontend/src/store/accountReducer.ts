// action - state management
import { LOADER, LOGIN, LOGOUT, REGISTER } from './actions';
import { InitialLoginContextProps } from 'types/auth';

// ==============================|| ACCOUNT REDUCER ||============================== //

interface AccountReducerActionProps {
    type: string;
    payload?: InitialLoginContextProps;
    isLoggedIn?: boolean;
}

const initialState: InitialLoginContextProps = {
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    loader: false
};

// eslint-disable-next-line
const accountReducer = (state = initialState, action: AccountReducerActionProps) => {
    switch (action.type) {
        case LOADER: {
            const { loader } = action.payload!;
            return {
                ...state,
                loader
            };
        }
        case REGISTER: {
            const { user } = action.payload!;
            return {
                ...state,
                user
            };
        }
        case LOGIN: {
            const { user } = action.payload!;
            return {
                ...state,
                isLoggedIn: true,
                isInitialized: true,
                user
            };
        }
        case LOGOUT: {
            return {
                ...state,
                isInitialized: true,
                isLoggedIn: false,
                user: null
            };
        }
        default: {
            return { ...state };
        }
    }
};

export default accountReducer;
