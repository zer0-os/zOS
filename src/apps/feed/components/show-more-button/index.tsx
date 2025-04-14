import { FC } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';

interface ShowMoreButtonProps {
  className?: string;

  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ShowMoreButton: FC<ShowMoreButtonProps> = ({ className, onClick }) => {
  return (
    <button
      className={classNames(styles.ShowMore, className)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      Show more
    </button>
  );
};
