import { ReactNode } from 'react';
import styles from './button.module.scss';

interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export const Button = ({ children, icon, onClick, disabled }: ButtonProps) => {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </button>
  );
};
