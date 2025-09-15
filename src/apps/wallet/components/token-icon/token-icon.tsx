import styles from './token-icon.module.scss';
import { ZChainIcon, AvaxIcon, EthereumIcon, BaseIcon } from '../../../../components/chain-icons';
import cn from 'classnames';

const ICONS = {
  1417429182: <ZChainIcon />,
  9369: <ZChainIcon />,
  43114: <AvaxIcon />,
  43113: <AvaxIcon />,
  1: <EthereumIcon />,
  11155111: <EthereumIcon />,
  8453: <BaseIcon />,
  84532: <BaseIcon />,
};

interface TokenIconProps {
  url: string;
  name: string;
  chainId?: number;
  className?: string;
}

export const TokenIcon = ({ url, name, chainId = 9369, className }: TokenIconProps) => {
  return (
    <div className={cn(styles.tokenIcon, className)}>
      {url ? <img src={url} alt={name} /> : <div className={styles.fallback}>{name.substring(0, 1).toUpperCase()}</div>}
      {chainId && ICONS[chainId] && <div className={styles.chainIcon}>{ICONS[chainId]}</div>}
    </div>
  );
};
