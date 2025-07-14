import React, { useState, useEffect } from 'react';

import { Modal } from '@zero-tech/zui/components/Modal';
import { LaunchCommunityStage } from './stages/launch-community-stage';
import { FindTokenStage } from './stages/find-token-stage';
import { ExtractTokenStage } from './stages/extract-token-stage';
import { CreateZidStage } from './stages/create-zid-stage';
import { ReviewStage } from './stages/review-stage';
import { CreatingChannelStage } from './stages/creating-channel-stage';
import { IconButton } from '@zero-tech/zui/components';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { TokenData } from './hooks/useTokenFinder';

import styles from './styles.module.scss';

export interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export enum CreateChannelStage {
  LaunchCommunity = 'LaunchCommunity',
  FindToken = 'FindToken',
  ExtractToken = 'ExtractToken',
  CreateZid = 'CreateZid',
  Review = 'Review',
  Creating = 'Creating',
}

export const CreateChannelModal = ({ open, onOpenChange }: CreateChannelModalProps) => {
  const [stage, setStage] = useState<CreateChannelStage>(CreateChannelStage.LaunchCommunity);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  useEffect(() => {
    if (!open) {
      setStage(CreateChannelStage.LaunchCommunity);
      setTokenData(null);
    }
  }, [open]);

  const handleBack = () => {
    if (stage === CreateChannelStage.FindToken) {
      setStage(CreateChannelStage.LaunchCommunity);
    } else if (stage === CreateChannelStage.ExtractToken) {
      setStage(CreateChannelStage.FindToken);
    } else if (stage === CreateChannelStage.CreateZid) {
      setStage(CreateChannelStage.ExtractToken);
    } else if (stage === CreateChannelStage.Review) {
      setStage(CreateChannelStage.CreateZid);
    }
  };

  const handleTokenFound = (token: TokenData) => {
    setTokenData(token);
    setStage(CreateChannelStage.ExtractToken);
  };

  let content = null;
  switch (stage) {
    case CreateChannelStage.LaunchCommunity:
      content = <LaunchCommunityStage onNext={() => setStage(CreateChannelStage.FindToken)} />;
      break;
    case CreateChannelStage.FindToken:
      content = <FindTokenStage onTokenFound={handleTokenFound} />;
      break;
    case CreateChannelStage.ExtractToken:
      content = <ExtractTokenStage token={tokenData} onNext={() => setStage(CreateChannelStage.CreateZid)} />;
      break;
    case CreateChannelStage.CreateZid:
      content = <CreateZidStage onNext={() => setStage(CreateChannelStage.Review)} />;
      break;
    case CreateChannelStage.Review:
      content = <ReviewStage onNext={() => setStage(CreateChannelStage.Creating)} />;
      break;
    case CreateChannelStage.Creating:
      content = <CreatingChannelStage onComplete={() => onOpenChange(false)} />;
      break;
    default:
      content = null;
  }

  return (
    <Modal className={styles.Modal} open={open} onOpenChange={onOpenChange}>
      <div className={styles.ModalContent}>
        {stage !== CreateChannelStage.LaunchCommunity && stage !== CreateChannelStage.Creating && (
          <IconButton className={styles.BackButton} onClick={handleBack} Icon={IconArrowLeft} aria-label='Back' />
        )}
        {content}
      </div>
    </Modal>
  );
};
