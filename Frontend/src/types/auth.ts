export type Auth0ContextType = {
    isLoggedIn?: boolean;
    isInitialized?: boolean;
    user?: any | null | undefined;
    logout?: () => void;
    login?: () => void;
    resetPassword?: (email: string) => void;
    updateProfile?: VoidFunction;
};

export interface JWTDataProps {
    userId?: string;
}

export type JWTContextType = {
    isLoggedIn?: boolean;
    isInitialized?: boolean;
    user?: any | null | undefined;
    logout?: any | null;
    login?: any | null;
    register?: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    resetPassword?: (email: string) => void;
    updateProfile?: VoidFunction;
    dispatchLoader?: any;
};

export interface InitialLoginContextProps {
    isLoggedIn?: boolean;
    isInitialized?: boolean;
    user?: any | null | undefined;
    loader?: boolean;
}
