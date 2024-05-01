import * as React from 'react';

import { WorldPanelItem } from './world-panel-item';
import { IconDotsGrid, IconHelpCircle, IconMessageSquare2 } from '@zero-tech/zui/icons';
import { MoreAppsModal } from './more-apps-modal';

import { bemClassName } from '../../lib/bem';

import './styles.scss';
import { UserFeedbackContainer } from './user-feedback-modal/container';

const cn = bemClassName('app-bar');

export interface Properties {}

interface State {
  isMoreAppsModalOpen: boolean;
  isUserFeedbackModalOpen: boolean;
}

export class AppBar extends React.Component<Properties, State> {
  state = { isMoreAppsModalOpen: false, isUserFeedbackModalOpen: false };

  openMoreAppsModal = () => {
    this.setState({ isMoreAppsModalOpen: true });
  };
  openUserFeedbackModal = () => {
    this.setState({ isUserFeedbackModalOpen: true });
  };
  closeMoreAppsModal = () => {
    this.setState({ isMoreAppsModalOpen: false });
  };
  closeUserFeedbackModal = () => {
    this.setState({ isUserFeedbackModalOpen: false });
  };

  render() {
    return (
      <>
        <div {...cn('')}>
          <WorldPanelItem Icon={IconMessageSquare2} label='Messenger' isActive />
          <WorldPanelItem Icon={IconDotsGrid} label='More Apps' isActive={false} onClick={this.openMoreAppsModal} />
          <WorldPanelItem Icon={IconHelpCircle} label='Help' isActive={false} onClick={this.openUserFeedbackModal} />
        </div>
        {this.state.isMoreAppsModalOpen && <MoreAppsModal onClose={this.closeMoreAppsModal} />}
        {this.state.isUserFeedbackModalOpen && <UserFeedbackContainer onClose={this.closeUserFeedbackModal} />}
      </>
    );
  }
}
