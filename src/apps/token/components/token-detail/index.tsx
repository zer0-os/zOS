import React from 'react';
import { PanelBody } from '../../../../components/layout/panel';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconArrowLeft, IconLink, IconCopy2 } from '@zero-tech/zui/icons';
import { useZBancToken } from '../../hooks/useZBancToken';
import { formatTotalSupply } from '../utils';

import styles from './styles.module.scss';

interface TokenDetailProps {
  tokenAddress: string;
  onBack: () => void;
}

export const TokenDetail = ({ tokenAddress, onBack }: TokenDetailProps) => {
  const { data: token, isLoading, error } = useZBancToken(tokenAddress);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(tokenAddress);
  };

  const handleViewOnExplorer = () => {
    const explorerUrl = `https://explorer.zchain.tech/address/${tokenAddress}`;
    window.open(explorerUrl, '_blank');
  };

  if (isLoading) {
    return (
      <PanelBody className={styles.TokenDetail}>
        <div className={styles.Loading}>
          <div className={styles.Spinner} />
          <span>Loading token details...</span>
        </div>
      </PanelBody>
    );
  }

  if (error || !token) {
    return (
      <PanelBody className={styles.TokenDetail}>
        <div className={styles.Error}>
          <div className={styles.ErrorTitle}>Token Not Found</div>
          <div className={styles.ErrorMessage}>{error?.message || 'The requested token could not be found.'}</div>
          <Button variant={ButtonVariant.Primary} onPress={onBack}>
            Back to Tokens
          </Button>
        </div>
      </PanelBody>
    );
  }

  return (
    <PanelBody className={styles.TokenDetail}>
      <div className={styles.Container}>
        <div className={styles.Header}>
          <Button variant={ButtonVariant.Secondary} onPress={onBack} className={styles.BackButton}>
            <IconArrowLeft size={16} />
            Back
          </Button>
        </div>

        <div className={styles.TokenHeader}>
          <div className={styles.TokenIcon}>
            {token.iconUrl ? (
              <img src={token.iconUrl} alt={`${token.name} icon`} className={styles.IconImage} />
            ) : (
              <div className={styles.IconPlaceholder}>{token.symbol.substring(0, 2).toUpperCase()}</div>
            )}
          </div>
          <div className={styles.TokenInfo}>
            <h1 className={styles.TokenName}>{token.name}</h1>
            <div className={styles.TokenSymbol}>{token.symbol}</div>
            <div className={styles.TokenAddress}>
              <span className={styles.AddressText}>{tokenAddress}</span>
              <button className={styles.CopyButton} onClick={handleCopyAddress}>
                <IconCopy2 size={14} />
              </button>
              <button className={styles.ExplorerButton} onClick={handleViewOnExplorer}>
                <IconLink size={14} />
              </button>
            </div>
          </div>
          <div className={styles.TokenStatus}>
            <div className={`${styles.StatusBadge} ${styles[token.graduated ? 'Graduated' : 'Active']}`}>
              {token.graduated ? 'Graduated to Uniswap V3' : 'Active on ZBanc'}
            </div>
          </div>
        </div>

        {token.description && (
          <div className={styles.DescriptionSection}>
            <h3 className={styles.SectionTitle}>Description</h3>
            <p className={styles.Description}>{token.description}</p>
          </div>
        )}

        <div className={styles.DetailsGrid}>
          <div className={styles.DetailSection}>
            <h3 className={styles.SectionTitle}>Token Information</h3>
            <div className={styles.DetailList}>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Name:</span>
                <span className={styles.DetailValue}>{token.name}</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Symbol:</span>
                <span className={styles.DetailValue}>{token.symbol}</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Decimals:</span>
                <span className={styles.DetailValue}>{token.decimals}</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Total Supply:</span>
                <span className={styles.DetailValue}>{formatTotalSupply(token.totalSupply, token.decimals)}</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Status:</span>
                <span className={styles.DetailValue}>{token.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Graduated:</span>
                <span className={styles.DetailValue}>{token.graduated ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className={styles.DetailSection}>
            <h3 className={styles.SectionTitle}>Asset Information</h3>
            <div className={styles.DetailList}>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Reserve Asset:</span>
                <span className={styles.DetailValue}>{token.asset.symbol}</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Asset Address:</span>
                <span className={styles.DetailValue}>{token.asset.address}</span>
              </div>
            </div>
          </div>

          <div className={styles.DetailSection}>
            <h3 className={styles.SectionTitle}>Fee Structure</h3>
            <div className={styles.DetailList}>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Vault Entry Fee:</span>
                <span className={styles.DetailValue}>{(token.fees.vaultEntryFee / 10000).toFixed(2)}%</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Vault Exit Fee:</span>
                <span className={styles.DetailValue}>{(token.fees.vaultExitFee / 10000).toFixed(2)}%</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Protocol Entry Fee:</span>
                <span className={styles.DetailValue}>{(token.fees.protocolEntryFee / 10000).toFixed(2)}%</span>
              </div>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Protocol Exit Fee:</span>
                <span className={styles.DetailValue}>{(token.fees.protocolExitFee / 10000).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className={styles.DetailSection}>
            <h3 className={styles.SectionTitle}>Creator Information</h3>
            <div className={styles.DetailList}>
              <div className={styles.DetailItem}>
                <span className={styles.DetailLabel}>Creator Address:</span>
                <span className={styles.DetailValue}>{token.creatorAddress}</span>
              </div>
              {token.creatorUserId && (
                <div className={styles.DetailItem}>
                  <span className={styles.DetailLabel}>Creator User ID:</span>
                  <span className={styles.DetailValue}>{token.creatorUserId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PanelBody>
  );
};
