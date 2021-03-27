import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// Optional
import Spinner from '../layout/Spinner';


// private route takes component and any other properties
// destructuring logic: we don't want to use props.something everytime
// we don't want to use props.auth.isAuthenticated => { auth: {isAuthenticated, loading}} = we first destructure and grab auth from props.auth. Then we further get isAuthenticate and loading from that 
const PrivateRoute = ({
        component: Component,
        auth: {isAuthenticated, loading },
        path
    }) => {
    return (!isAuthenticated && !loading ?
        <Redirect to="/login"/> :
        <Route exact path={path} component={Component} />
    )    
}

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute)
