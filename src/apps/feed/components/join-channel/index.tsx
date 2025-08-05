import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconLock } from '@zero-tech/zui/icons';
import { useJoinTokenGatedChannel } from './hooks/useJoinTokenGatedChannel';
import { openAccountManagement } from '../../../../store/user-profile';

import styles from './styles.module.scss';

interface TokenRequirements {
  symbol: string;
  amount: string;
  address: string;
  network: string;
}

interface JoinChannelProps {
  zid: string;
  tokenRequirements?: TokenRequirements;
  isLegacyChannel?: boolean;
}

export const JoinChannel: React.FC<JoinChannelProps> = ({ zid, tokenRequirements, isLegacyChannel }) => {
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinChannelMutation = useJoinTokenGatedChannel();
  const dispatch = useDispatch();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleJoin = useCallback(async () => {
    setJoinError(null);
    // Reset the mutation state to clear previous error
    joinChannelMutation.reset();
    joinChannelMutation.mutate(zid);
  }, [joinChannelMutation, zid]);

  const onManageAccounts = useCallback(() => {
    dispatch(openAccountManagement());
  }, [dispatch]);

  // Handle mutation state changes
  useEffect(() => {
    if (joinChannelMutation.isError) {
      const errorMessage = joinChannelMutation.error?.message || '';

      // Check for specific error types
      if (errorMessage.includes('Too Many Requests') || errorMessage.includes('rate limit')) {
        setJoinError(
          'Too many requests. Please wait a moment and try again. This usually happens when the network is busy.'
        );
      } else {
        setJoinError(
          isLegacyChannel
            ? `Failed to join channel. You must own a subdomain of 0://${zid} to join.`
            : `Failed to join channel. You must hold ${tokenRequirements?.amount} ${tokenRequirements?.symbol} in a connected self custody wallet to join.`
        );
      }
    } else if (joinChannelMutation.isSuccess) {
      // Success - the mutation will automatically invalidate queries and refresh the UI
      // The user will now see the FeedChatContainer instead of JoinChannel
    }
  }, [
    joinChannelMutation.isError,
    joinChannelMutation.isSuccess,
    joinChannelMutation.error,
    zid,
    isLegacyChannel,
    tokenRequirements,
  ]);

  const renderContent = () => {
    return (
      <div className={styles.JoinContent}>
        <div className={styles.LockIcon}>
          <IconLock size={48} />
        </div>

        <div className={styles.JoinTitle}>Join Token-Gated Channel</div>

        <div className={styles.JoinText}>
          {isLegacyChannel
            ? `This channel requires you to own a subdomain of 0://${zid} in a connected self-custody wallet to join.`
            : `This channel requires you to hold ${tokenRequirements?.amount} ${tokenRequirements?.symbol} in a connected self-custody wallet to join.`}
        </div>

        <div className={styles.JoinText}>
          You can check and add associated wallets in the
          <Button className={styles.ManageWalletsButton} variant={ButtonVariant.Secondary} onPress={onManageAccounts}>
            Manage Wallets
          </Button>
          section of your profile.
        </div>

        <div className={styles.TokenInfoBox}>
          {isLegacyChannel ? (
            <>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Domain</span>
                <span className={styles.InfoRowValue}>0://{zid}</span>
              </div>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Requirement</span>
                <span className={styles.InfoRowValue}>Subdomain ownership</span>
              </div>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Example</span>
                <span className={styles.InfoRowValue}>0://{zid}.example</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Token Symbol</span>
                <span className={styles.InfoRowValue}>{tokenRequirements?.symbol}</span>
              </div>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Required Amount</span>
                <span className={styles.InfoRowValue}>
                  {tokenRequirements?.amount} {tokenRequirements?.symbol}
                </span>
              </div>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Token Address</span>
                <span className={styles.InfoRowValue}>{formatAddress(tokenRequirements?.address || '')}</span>
              </div>
              <div className={styles.InfoRow}>
                <span className={styles.InfoRowLabel}>Network</span>
                <span className={styles.InfoRowValue}>{tokenRequirements?.network}</span>
              </div>
            </>
          )}
        </div>

        {!isLegacyChannel && (
          <Button
            className={styles.JoinButton}
            variant={ButtonVariant.Primary}
            onPress={handleJoin}
            isDisabled={joinChannelMutation.isPending}
            isLoading={joinChannelMutation.isPending}
          >
            Join Channel
          </Button>
        )}

        <div className={styles.ErrorContainer}>
          <div className={`${styles.ErrorMessage} ${joinError ? styles.ErrorVisible : styles.ErrorHidden}`}>
            {joinError || ' '}
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
};
