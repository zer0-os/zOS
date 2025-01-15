import styles from './styles.module.scss';

export const Message = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.Message}>{children}</div>;
};
