import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Sidekick } from '../../components/sidekick/index';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { MessengerChat } from '../../components/messenger/chat';
import { MessengerFeed } from '../../components/messenger/feed';
import { DevPanelContainer } from '../../components/dev-panel/container';
import { FeatureFlag } from '../../components/feature-flag';
import { denormalize } from '../../store/channels';
import { JoiningConversationDialog } from '../../components/joining-conversation-dialog';

import styles from './Main.module.scss';

export interface Properties {
  context: {
    isAuthenticated: boolean;
  };
  isValidConversation: boolean;
  isSocialChannel: boolean;
  isJoiningConversation: boolean;
  isConversationsLoaded: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation, isConversationsLoaded },
    } = state;

    const currentChannel = denormalize(activeConversationId, state) || null;

    return {
      isValidConversation: !!activeConversationId,
      isSocialChannel: currentChannel?.isSocialChannel,
      isJoiningConversation,
      isConversationsLoaded,
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
              {this.props.isJoiningConversation && <JoiningConversationDialog />}

              {this.props.isConversationsLoaded &&
                this.props.isValidConversation &&
                (this.props.isSocialChannel ? <MessengerFeed /> : <MessengerChat />)}
            </div>
            {this.props.isConversationsLoaded && <Sidekick variant='secondary' />}

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
