import { IconCopy2, IconLinkExternal1 } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { formatAddress, getExplorerAddressUrl, ZERO_ADDRESS, getL1L2TokenInfo } from '../../lib/utils';
import styles from './bridge-token-info.module.scss';

interface BridgeTokenInfoProps {
  fromToken: {
    chainId: number;
    tokenAddress?: string;
  } | null;
  toToken: {
    chainId: number;
    tokenAddress?: string;
  } | null;
}

export const BridgeTokenInfo = ({ fromToken, toToken }: BridgeTokenInfoProps) => {
  if (!fromToken || !toToken) {
    return null;
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExternalLink = (address: string | undefined, chainId: number) => {
    if (!address || address === ZERO_ADDRESS) {
      return;
    }
    const url = getExplorerAddressUrl(address, chainId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const tokenInfo = getL1L2TokenInfo(fromToken, toToken);
  if (!tokenInfo) return null;

  const { l1Address, l2Address, l1ChainId, l2ChainId } = tokenInfo;

  return (
    <div className={styles.container}>
      <div className={styles.infoRow}>
        <div className={styles.label}>
          <span>L1 token address:</span>
        </div>
        <div className={styles.addressContainer}>
          <span className={styles.address}>{formatAddress(l1Address)}</span>
          <IconButton
            Icon={IconCopy2}
            onClick={() => handleCopy(l1Address || '')}
            aria-label='Copy address'
            size={16}
          />
          {l1Address && l1Address !== ZERO_ADDRESS && (
            <IconButton
              Icon={IconLinkExternal1}
              onClick={() => handleExternalLink(l1Address, l1ChainId)}
              aria-label='View on explorer'
              size={16}
            />
          )}
        </div>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.label}>
          <span>L2 token address:</span>
        </div>
        <div className={styles.addressContainer}>
          <span className={styles.address}>{formatAddress(l2Address)}</span>
          <IconButton
            Icon={IconCopy2}
            onClick={() => handleCopy(l2Address || '')}
            aria-label='Copy address'
            size={16}
          />
          {l2Address && l2Address !== ZERO_ADDRESS && (
            <IconButton
              Icon={IconLinkExternal1}
              onClick={() => handleExternalLink(l2Address, l2ChainId)}
              aria-label='View on explorer'
              size={16}
            />
          )}
        </div>
      </div>
    </div>
  );
};
