import styles from './token-icon.module.scss';
import { ZChainIcon } from './icons/zchain';
import cn from 'classnames';

const ICONS = {
  1417429182: <ZChainIcon />,
  9369: <ZChainIcon />,
};

interface TokenIconProps {
  url: string;
  name: string;
  chainId?: number;
  className?: string;
}

export const TokenIcon = ({ url, name, chainId, className }: TokenIconProps) => {
  return (
    <div className={cn(styles.tokenIcon, className)}>
      {url ? <img src={url} alt={name} /> : <div className={styles.fallback}>{name.substring(0, 1).toUpperCase()}</div>}
      {chainId && ICONS[chainId] && <div className={styles.chainIcon}>{ICONS[chainId]}</div>}
    </div>
  );
};
