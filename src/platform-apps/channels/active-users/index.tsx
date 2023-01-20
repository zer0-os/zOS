import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { setActiveChannelId } from '../../../store/chat';
import { RootState } from '../../../store';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

interface Properties extends PublicProperties {
  setActiveChannelId: (channelId: string) => void;
  activeChannelId: RootState['chat']['activeChannelId'];
}

class Component extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeChannelId },
    } = state;

    return {
      activeChannelId,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setActiveChannelId };
  }

  onUserClick = (): void => {
    const channel1 = '276768255_297b7308d116c6c7ba688a0cde572f96b394cc69';
    const channelId2 = '277215359_93d7bbf03481a332bbe9d0705c98ef1d1ea6712f';
    this.props.setActiveChannelId(this.props.activeChannelId === channel1 ? channelId2 : channel1);
  };

  renderUser = (): JSX.Element => {
    return (
      <div
        className='active-users__user'
        onClick={this.onUserClick}
      >
        <div className='active-users__user-status'></div>
        <div className='active-users__user-name'>John</div>
      </div>
    );
  };

  render() {
    return <div className='active-users'>{Array.from({ length: 10 }).map(this.renderUser)}</div>;
  }
}

export const ActiveUsers = connectContainer<PublicProperties>(Component);
