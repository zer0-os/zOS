import React, { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconLock } from '@zero-tech/zui/icons';
import { Panel, PanelBody, PanelHeader, PanelTitle } from '../../../../components/layout/panel';
import { SagaActionTypes } from '../../../../store/chat';
import { config } from '../../../../config';
import { RootState } from '../../../../store';

import styles from './styles.module.scss';

interface TokenRequirements {
  symbol: string;
  amount: string;
  address: string;
}

interface JoinChannelProps {
  zid: string;
  tokenRequirements?: TokenRequirements;
  isLegacyChannel?: boolean;
}

const selectChatState = (state: RootState) => ({
  joinRoomErrorContent: state.chat.joinRoomErrorContent,
  isJoiningConversation: state.chat.isJoiningConversation,
});

export const JoinChannel: React.FC<JoinChannelProps> = ({ zid, tokenRequirements, isLegacyChannel }) => {
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { joinRoomErrorContent, isJoiningConversation } = useSelector(selectChatState);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleJoin = useCallback(async () => {
    setJoinError(null);
    setIsJoining(true);
    setHasAttemptedJoin(true);

    const zna = zid.replace('0://', '');
    const roomAlias = `${zna}:${config.matrixHomeServerName}`;

    // Dispatch validateFeedChat to attempt joining and validate requirements
    dispatch({
      type: SagaActionTypes.ValidateFeedChat,
      payload: { id: roomAlias },
    });
  }, [
    dispatch,
    zid,
  ]);

  // Watch for Redux state changes to handle success/error
  useEffect(() => {
    if (!hasAttemptedJoin) {
      return; // Don't process anything until user actually attempts to join
    }

    if (joinRoomErrorContent) {
      setJoinError(
        isLegacyChannel
          ? `Failed to join channel. You must own a subdomain of 0://${zid} to join.`
          : `Failed to join channel. You must hold ${tokenRequirements?.amount} ${tokenRequirements?.symbol} to join.`
      );
      setIsJoining(false);
    } else if (!isJoiningConversation && !joinRoomErrorContent && hasAttemptedJoin) {
      setIsJoining(false);
      // Invalidate cache to trigger refetch and show chat interface
      queryClient.invalidateQueries({ queryKey: ['channel-info', zid] });
    }
  }, [
    joinRoomErrorContent,
    isJoiningConversation,
    hasAttemptedJoin,
    history,
    zid,
    isLegacyChannel,
    tokenRequirements,
    queryClient,
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
            ? `This channel requires you to own a subdomain of 0://${zid} to join.`
            : `This channel requires you to hold ${tokenRequirements?.amount} ${tokenRequirements?.symbol} to join.`}
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
            </>
          )}
        </div>

        <Button
          className={styles.JoinButton}
          variant={ButtonVariant.Primary}
          onPress={handleJoin}
          isDisabled={isJoining}
          isLoading={isJoining}
        >
          Join Channel
        </Button>

        <div className={styles.ErrorContainer}>
          <div className={`${styles.ErrorMessage} ${joinError ? styles.ErrorVisible : styles.ErrorHidden}`}>
            {joinError || ' '}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Panel className={styles.Container}>
      <PanelHeader className={styles.PanelHeader}>
        <PanelTitle className={styles.PanelTitle}>0://{zid}</PanelTitle>
      </PanelHeader>
      <PanelBody className={styles.Panel}>{renderContent()}</PanelBody>
    </Panel>
  );
};
