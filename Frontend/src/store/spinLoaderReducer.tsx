
import { SPIN_LOADERS } from './actions';
const initialState = {
    spinLoaderShow: false
}

const getSpinLoader = (state: any, payload: any) => ({
    ...state,
    spinLoaderShow: payload
})

export default function spin(state = initialState, action: any) {

    switch (action.type) {
        case SPIN_LOADERS:
            return getSpinLoader(state, action.payload)
        default:
            return state
    }
}