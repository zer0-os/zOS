import ZeroLogo from '../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import styles from './oauth-callback.module.scss';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loginByOAuth } from '../store/login';

export function OAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionTokenref = useRef(urlParams.get('sessionEstablishmentToken'));
  const dispatch = useDispatch();

  // Exchange the session establishment token for a session cookie and redirect to the home page
  useEffect(() => {
    if (sessionTokenref.current) {
      dispatch(loginByOAuth(sessionTokenref.current));
      sessionTokenref.current = null;
    }
  }, [dispatch]);

  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div className={styles.container}>
        <ZeroLogo />
        <p>Log In Successful</p>
      </div>
    </>
  );
}
