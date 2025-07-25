import classNames from 'classnames';
import styles from './styles.module.scss';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return <div className={classNames(styles.Card, className)}>{children}</div>;
};
