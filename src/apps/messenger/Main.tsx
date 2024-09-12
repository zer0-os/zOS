import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Sidekick } from '../../components/sidekick/index';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { MessengerChat } from '../../components/messenger/chat';
import { MessengerFeed } from '../../components/messenger/feed';
import { DevPanelContainer } from '../../components/dev-panel/container';
import { FeatureFlag } from '../../components/feature-flag';

import styles from './Main.module.scss';
import { denormalize } from '../../store/channels';
import { ConversationActionsContainer as ConversationActions } from '../../components/messenger/conversation-actions/container';

export interface Properties {
  context: {
    isAuthenticated: boolean;
  };
  isValidConversation: boolean;
  isSocialChannel: boolean;
  isJoiningConversation: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation },
    } = state;

    const currentChannel = denormalize(activeConversationId, state) || null;

    return {
      isValidConversation: !!activeConversationId,
      isSocialChannel: currentChannel?.isSocialChannel,
      isJoiningConversation,
    };
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <>
        {this.props.context.isAuthenticated && (
          <>
            <Sidekick />

            <div className={styles.Split}>
              <ConversationActions className={styles.Actions} />

              {this.props.isSocialChannel && !this.props.isJoiningConversation && this.props.isValidConversation && (
                <FeatureFlag featureFlag='enableChannels'>
                  <MessengerFeed />
                </FeatureFlag>
              )}

              <MessengerChat />
            </div>
            <Sidekick variant='secondary' />

            <FeatureFlag featureFlag='enableDevPanel'>
              <DevPanelContainer />
            </FeatureFlag>
          </>
        )}
      </>
    );
  }
}

export const Main = withAuthenticationContext<{}>(connectContainer<{}>(Container));
