import { EpicGamesLoginButton } from './login-buttons/epic-games';
import styles from './social-login.module.scss';

export const SocialLogin = () => {
  return (
    <div className={styles.container}>
      <EpicGamesLoginButton />
    </div>
  );
};
