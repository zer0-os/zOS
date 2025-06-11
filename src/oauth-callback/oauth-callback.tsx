import ZeroLogo from '../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import styles from './oauth-callback.module.scss';
import { useEffect } from 'react';

export function OAuthCallback() {
  useEffect(() => {
    localStorage.setItem('oauth-callback-success', Math.random().toString());
    setTimeout(() => {
      window.close();
    }, 3000);
  }, []);

  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div className={styles.container}>
        <ZeroLogo />
        <p>Account Linked Successfully</p>
        <p>You can now close this window</p>
      </div>
    </>
  );
}
