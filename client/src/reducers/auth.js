import { 
    REGISTER_SUCCESS, 
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
}

export default function (state = initialState, action) {
    const { type, payload } = action;
    switch(type) {
        case USER_LOADED:
            return {...state, isAuthenticated: true, loading: false, user: payload}
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
            // we use localStorage for convenience. Without it, in auth.js actions, we need to set it up as a function component, mapStateToProps, use connect
            localStorage.setItem('token', payload.token);
            // payload... => { token: token }
            return {...state, ...payload, isAuthenticated: true, loading: false}
        case REGISTER_FAIL:
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT:
            localStorage.removeItem('token');
            return {...state, token: null, isAuthenticated: false, loading: false}
        default:
             return state;
    }
}