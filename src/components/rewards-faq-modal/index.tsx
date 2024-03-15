import * as React from 'react';

import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton, Modal, Accordion } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
import { rewardsFaq } from './constants';
const c = bem('rewards-faq-modal');

export interface Properties {
  isRewardsFAQModalOpen: boolean;

  closeRewardsFAQModal: () => void;
}

export class RewardsFAQModal extends React.Component<Properties> {
  closeRewardsFAQModal = (): void => {
    this.props.closeRewardsFAQModal();
  };

  render() {
    return (
      <div>
        <Modal open={this.props.isRewardsFAQModalOpen} onOpenChange={this.closeRewardsFAQModal} className={c('')}>
          <div className={c('title-bar')}>
            <h3 className={c('title')}>ZERO Rewards</h3>
            <IconButton size='large' Icon={IconXClose} onClick={this.closeRewardsFAQModal} />
          </div>
          <Accordion contrast='low' items={rewardsFaq} />
        </Modal>
      </div>
    );
  }
}
