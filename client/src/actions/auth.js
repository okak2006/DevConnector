import { setAlert } from './alert'
import api from '../apis/api';
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    CLEAR_PROFILE
} from './types';
import setAuthToken from '../utils/setAuthToken'

// Load User
export const loadUser = () => async dispatch => {
    if(localStorage.token) {
        setAuthToken(localStorage.token);
    }
    try {
        //res.data from backend api/auth route returns user info (- password) decoded from jwt token
        const res = await api.get('/api/auth');
        dispatch({
            type: USER_LOADED,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: AUTH_ERROR,
        })
    }
}


// Register User
export const register = ({ name, email, password}) => async dispatch => {
    const config = {
        headers: {
            'Content-Type' : 'application/json'
        }
    };

    const body = JSON.stringify({ name, email, password });

    try {
        const res = await api.post('/api/users', body, config);
        // on success backend returns { token: token } which we want to keep track as state
        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        });
        dispatch(loadUser());
    } catch (err) {
        const errors = err.response.data.errors;

        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        };

        dispatch({
            type: REGISTER_FAIL
        })
    }
}

// Login User
export const login = ({ email, password }) => async dispatch => {
    const config = {
        headers: {
            'Content-Type' : 'application/json'
        }
    };

    const body = JSON.stringify({ email, password });

    try {
        const res = await api.post('/api/auth', body, config);
        // on success backend returns { token: token } which we want to keep track as state
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        });
        // you can dispatch a function as long as that function dispatches an action object (i.e. that function has dipsatch({type: xxx, payload: xxx}) inside)
        dispatch(loadUser());
    } catch (err) {
        const errors = err.response.data.errors;

        if(errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        };

        dispatch({
            type: LOGIN_FAIL
        })
    }
}

// Logout / Clear Profile
export const logout = () => dispatch => {
    dispatch({ type: CLEAR_PROFILE });
    dispatch({ type: LOGOUT });
}