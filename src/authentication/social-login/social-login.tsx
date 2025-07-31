import { EpicGamesLoginButton } from './login-buttons/epic-games';
import { XLoginButton } from './login-buttons/x-login-button';
import styles from './social-login.module.scss';

export const SocialLogin = () => {
  return (
    <div className={styles.container}>
      <EpicGamesLoginButton />
      <XLoginButton />
    </div>
  );
};
