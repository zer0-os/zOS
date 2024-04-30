import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducer';

export const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isLoggedIn = useSelector((state: RootState) => state.authentication.isLoggedIn);

  return <Route {...rest} render={(props) => (isLoggedIn ? <Component {...props} /> : <Redirect to='/login' />)} />;
};
