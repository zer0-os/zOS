import styles from './styles.module.scss';

interface LoginButtonProperties {
  onClick: () => void;
  imageUrl: string;
  alt: string;
}

export const LoginButton = ({ onClick, imageUrl, alt }: LoginButtonProperties) => {
  return (
    <div className={styles.loginButton} onClick={onClick}>
      <img src={imageUrl} alt={alt} />
    </div>
  );
};
