import JWTContext from 'contexts/JWTContext';
import { useContext } from 'react';


// ==============================|| AUTH HOOKS ||============================== //

const useJWT = () => {
    const context = useContext(JWTContext);

    if (!context) throw new Error('context must be use inside provider');

    return context;
};

export default useJWT;
