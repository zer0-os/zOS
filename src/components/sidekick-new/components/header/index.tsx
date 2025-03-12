import { PropsWithChildren } from 'react';

import classNames from 'classnames';
import styles from './styles.module.scss';

export interface HeaderProps extends PropsWithChildren {
  className?: string;
}

export const Header = (props: HeaderProps) => {
  return <div className={classNames(styles.Header, props.className)}>{props.children}</div>;
};

export const Group = (props: HeaderProps) => {
  return <div className={classNames(styles.Group, props.className)}>{props.children}</div>;
};
