import ZeroLogo from '../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import styles from './oauth-callback.module.scss';
import { useEffect } from 'react';

export function OAuthLinkCallback() {
  const isCreate = window.location.search.includes('create');

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage('oauth-callback-success', window.location.origin);

      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, []);

  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div className={styles.container}>
        <ZeroLogo />
        <p>Account {isCreate ? 'Created' : 'Linked'} Successfully</p>
        <p>You can now close this window</p>
      </div>
    </>
  );
}
