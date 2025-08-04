import ZeroLogo from '../../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Button, Size, Variant } from '@zero-tech/zui/components/Button';
import styles from './oauth-consent.module.scss';
import { MatrixAvatar } from '../../components/matrix-avatar';
import { currentUserSelector } from '../../store/authentication/selectors';
import { useSelector } from 'react-redux';
import { post } from '../../lib/api/rest';
import { scopeDescriptions } from './scopes';

export function OAuthConsent() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('client_id');
  const clientName = urlParams.get('name');
  const scopes = urlParams.get('scopes')?.split(' ');
  const next = urlParams.get('next');
  const user = useSelector(currentUserSelector);

  const handleAllow = async (action: 'allow' | 'deny') => {
    await post('/id/consent')
      .send({
        clientId,
        scopes,
        next,
        action,
      })
      .then((res) => {
        const { next: nextUrl } = res.body;
        window.location.href = nextUrl;
      });
  };

  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div className={styles.container}>
        <div className={styles.consentBox}>
          <div className={styles.logo}>
            <ZeroLogo />
          </div>
          <p>
            <strong>{clientName} wants to access your Zero account.</strong>
          </p>

          <div className={styles.userInfo}>
            <MatrixAvatar size='medium' imageURL={user?.profileSummary.profileImage} />
            <div>
              <div className={styles.userName}>{user?.profileSummary.firstName}</div>
              <div className={styles.userZID}>{user?.primaryZID}</div>
            </div>
          </div>

          <div className={styles.buttons}>
            <Button size={Size.Large} onPress={() => handleAllow('allow')}>
              Allow
            </Button>
            <Button className={styles.denyButton} variant={Variant.Secondary} onPress={() => handleAllow('deny')}>
              Deny
            </Button>
          </div>

          <hr />

          <div className={styles.appDetails}>
            <div>Things {clientName} can view...</div>
            <ul>
              {scopes?.map((scope) => (
                <li key={scope}>{scopeDescriptions[scope]}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
