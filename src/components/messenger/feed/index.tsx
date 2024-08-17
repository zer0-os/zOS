import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { rawChannelSelector } from '../../../store/channels/saga';
import { Posts } from './components/posts';
import { ScrollbarContainer } from '../../scrollbar-container';
import { CreatePost } from './components/create-post';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('messenger-feed');

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isSocialChannel: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId },
    } = state;

    const currentChannel = rawChannelSelector(activeConversationId)(state);

    return { isSocialChannel: currentChannel?.isSocialChannel };
  }

  static mapActions(): Partial<Properties> {
    return {};
  }

  render() {
    const { isSocialChannel } = this.props;

    if (!isSocialChannel) {
      return null;
    }

    return (
      <>
        <ScrollbarContainer>
          <div {...cn('')}>
            <CreatePost />
            <Posts />
          </div>
        </ScrollbarContainer>
        <div {...cn('divider')} />
      </>
    );
  }
}

export const MessengerFeed = connectContainer<PublicProperties>(Container);
