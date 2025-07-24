import ZeroLogo from '../../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginByOAuth } from '../../store/login';
import { Button } from '@zero-tech/zui/components/Button';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { errorsSelector } from '../../store/login/selectors';
import styles from './oauth-callback.module.scss';

export function OAuthCallback() {
  const loginErrors = useSelector(errorsSelector);
  const urlParams = new URLSearchParams(window.location.search);
  const establishmentToken = useRef(urlParams.get('sessionEstablishmentToken'));
  const error = loginErrors.length > 0 ? 'error' : urlParams.get('error');
  const errorDescription = loginErrors ? 'An unexpected error occurred' : urlParams.get('error_description');
  const userNotFound = error === 'USER_NOT_FOUND';
  const dispatch = useDispatch();

  // Exchange the session establishment token for a session cookie and redirect to the home page
  useEffect(() => {
    if (establishmentToken.current) {
      dispatch(loginByOAuth(establishmentToken.current));
      establishmentToken.current = null;
    }
  }, [dispatch]);

  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div className={styles.container}>
        {error ? (
          <>
            <ZeroLogo />
            {userNotFound ? (
              <>
                <p>We couldn't find an account associated with this provider.</p>
                <p>
                  Please{' '}
                  <Link className={styles.link} to='/get-access'>
                    create an account
                  </Link>{' '}
                  or choose a different login method.
                </p>
              </>
            ) : (
              <p>Error: {errorDescription}</p>
            )}
            <div className={styles.errorButton}>
              <Button
                onPress={() => {
                  window.location.href = '/login';
                }}
              >
                Return to Login
              </Button>
            </div>
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </>
  );
}
