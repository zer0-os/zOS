import React, { useState, useEffect } from 'react';

import { Modal } from '@zero-tech/zui/components/Modal';
import { OverviewStage } from './stages/overview-stage';
import { ExtractTokenStage } from './stages/extract-token-stage';
import { SetTokenAmountStage } from './stages/set-token-amount';
import { FindTokenStage } from './stages/find-token-stage';
import { ReviewStage } from './stages/review-stage';
import { UpdatingChannelStage } from './stages/updating-channel-stage';
import { IconButton } from '@zero-tech/zui/components';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { TokenData } from '../create-channel/lib/hooks/useTokenFinder';

import styles from './styles.module.scss';

export interface UpdateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zid: string;
}

export enum UpdateChannelStage {
  Overview = 'Overview',
  FindToken = 'FindToken',
  ExtractToken = 'ExtractToken',
  SetTokenAmount = 'SetTokenAmount',
  Review = 'Review',
  Updating = 'Updating',
}

export const UpdateChannelModal = ({ open, onOpenChange, zid }: UpdateChannelModalProps) => {
  const [stage, setStage] = useState<UpdateChannelStage>(UpdateChannelStage.Overview);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [tokenAmount, setTokenAmount] = useState<string>('');

  const isCriticalStage = stage === UpdateChannelStage.Review || stage === UpdateChannelStage.Updating;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isCriticalStage) {
      // Don't allow closing during critical stages
      return;
    }
    onOpenChange(newOpen);
  };

  useEffect(() => {
    if (!open) {
      setStage(UpdateChannelStage.Overview);
      setTokenData(null);
      setTokenAmount('');
    }
  }, [open]);

  const handleBack = () => {
    if (stage === UpdateChannelStage.FindToken) {
      setStage(UpdateChannelStage.Overview);
    } else if (stage === UpdateChannelStage.ExtractToken) {
      setStage(UpdateChannelStage.FindToken);
    } else if (stage === UpdateChannelStage.SetTokenAmount) {
      setStage(UpdateChannelStage.ExtractToken);
    } else if (stage === UpdateChannelStage.Review) {
      setStage(UpdateChannelStage.SetTokenAmount);
    }
  };

  const handleTokenFound = (token: TokenData) => {
    setTokenData(token);
    setStage(UpdateChannelStage.ExtractToken);
  };

  const handleTokenAmountSet = (amount: string) => {
    setTokenAmount(amount);
    setStage(UpdateChannelStage.Review);
  };

  let content = null;
  switch (stage) {
    case UpdateChannelStage.Overview:
      content = <OverviewStage onNext={() => setStage(UpdateChannelStage.FindToken)} />;
      break;
    case UpdateChannelStage.FindToken:
      content = <FindTokenStage onTokenFound={handleTokenFound} />;
      break;
    case UpdateChannelStage.ExtractToken:
      content = <ExtractTokenStage token={tokenData} onNext={() => setStage(UpdateChannelStage.SetTokenAmount)} />;
      break;
    case UpdateChannelStage.SetTokenAmount:
      content = <SetTokenAmountStage onNext={handleTokenAmountSet} tokenData={tokenData} />;
      break;
    case UpdateChannelStage.Review:
      content = (
        <ReviewStage
          onNext={() => setStage(UpdateChannelStage.Updating)}
          zid={zid}
          tokenData={tokenData}
          tokenAmount={tokenAmount}
        />
      );
      break;
    case UpdateChannelStage.Updating:
      content = <UpdatingChannelStage onComplete={() => onOpenChange(false)} />;
      break;
    default:
      content = null;
  }

  return (
    <Modal className={styles.Modal} open={open} onOpenChange={handleOpenChange}>
      <div className={styles.ModalContent}>
        {stage !== UpdateChannelStage.Overview && stage !== UpdateChannelStage.Updating && (
          <IconButton className={styles.BackButton} onClick={handleBack} Icon={IconArrowLeft} aria-label='Back' />
        )}
        {content}
      </div>
    </Modal>
  );
};
