import ZeroLogo from '../../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginByOAuth } from '../../store/login';
import { Button } from '@zero-tech/zui/components/Button';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import styles from './oauth-callback.module.scss';

export function OAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const establishmentToken = urlParams.get('sessionEstablishmentToken');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');
  const userNotFound = error === 'USER_NOT_FOUND';
  const dispatch = useDispatch();

  // Exchange the session establishment token for a session cookie and redirect to the home page
  useEffect(() => {
    if (establishmentToken) {
      dispatch(loginByOAuth(establishmentToken));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
