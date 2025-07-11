import { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './button.module.scss';

interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ children, icon, onClick, disabled, variant = 'primary' }: ButtonProps) => {
  return (
    <button className={classNames(styles.button, styles[variant])} onClick={onClick} disabled={disabled}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </button>
  );
};
