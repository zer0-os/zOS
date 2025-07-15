import React, { useState, useEffect, useMemo } from 'react';

import { Modal } from '@zero-tech/zui/components/Modal';
import { LaunchCommunityStage } from './stages/launch-community-stage';
import { FindTokenStage } from './stages/find-token-stage';
import { ExtractTokenStage } from './stages/extract-token-stage';
import { CreateZidStage } from './stages/create-zid-stage';
import { ReviewStage } from './stages/review-stage';
import { CreatingChannelStage } from './stages/creating-channel-stage';
import { IconButton } from '@zero-tech/zui/components';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { TokenData } from './lib/hooks/useTokenFinder';
import { ethers } from 'ethers';
import { config } from '../../../../config';

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
  const [selectedZid, setSelectedZid] = useState<string>('');
  const [priceData, setPriceData] = useState<any>(null);
  const [joiningFee, setJoiningFee] = useState<string>('');

  const mainnetProvider = useMemo(() => new ethers.providers.JsonRpcProvider(config.INFURA_URLS[1]), []);

  useEffect(() => {
    if (!open) {
      setStage(CreateChannelStage.LaunchCommunity);
      setTokenData(null);
      setSelectedZid('');
      setPriceData(null);
      setJoiningFee('');
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

  const handleZidSelected = (zid: string, price: any, fee: string) => {
    setSelectedZid(zid);
    setPriceData(price);
    setJoiningFee(fee);
    setStage(CreateChannelStage.Review);
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
      content = <CreateZidStage onNext={handleZidSelected} mainnetProvider={mainnetProvider} tokenData={tokenData} />;
      break;
    case CreateChannelStage.Review:
      content = (
        <ReviewStage
          onNext={() => setStage(CreateChannelStage.Creating)}
          selectedZid={selectedZid}
          priceData={priceData}
          joiningFee={joiningFee}
          tokenData={tokenData}
          mainnetProvider={mainnetProvider}
        />
      );
      break;
    case CreateChannelStage.Creating:
      content = <CreatingChannelStage onComplete={() => onOpenChange(false)} selectedZid={selectedZid} />;
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
