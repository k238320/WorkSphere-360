// third-party
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import spinLoader from './spinLoaderReducer';

// project imports
import snackbarReducer from './slices/snackbar';
import menuReducer from './slices/menu';

// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
    snackbar: snackbarReducer,

    menu: menuReducer,
    spinLoader
});

export default reducer;
