import classNames from 'classnames';

import styles from './percent-change.module.scss';

interface PercentChangeProps {
  percent: number;
  className?: string;
}

export const PercentChange = ({ percent, className }: PercentChangeProps) => {
  return (
    <div className={classNames(styles.percentChange, percent > 0 ? styles.positive : styles.negative, className)}>
      {percent === 0 ? '' : percent > 0 ? '+' : '-'}
      {Math.abs(percent)}%
    </div>
  );
};
