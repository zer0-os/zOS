import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { MessengerChat } from '../../components/messenger/chat';
import { DevPanelContainer } from '../../components/dev-panel/container';
import { FeatureFlag } from '../../components/feature-flag';
import { ConversationsSidekick } from '../../components/sidekick/variants/conversations-sidekick';
import { MembersSidekick } from '../../components/sidekick/variants/members-sidekick';
import { LoadingScreenContainer } from '../../components/loading-screen';

import styles from './Main.module.scss';

export interface Properties {
  context: {
    isAuthenticated: boolean;
  };
  isValidConversation: boolean;
  isJoiningConversation: boolean;
  isConversationsLoaded: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation, isConversationsLoaded },
    } = state;

    return {
      isValidConversation: !!activeConversationId,
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
            <ConversationsSidekick />
            <div className={styles.Split}>
              {this.props.isJoiningConversation && !this.props.isValidConversation && <LoadingScreenContainer />}

              {this.props.isConversationsLoaded && this.props.isValidConversation && <MessengerChat />}
            </div>
            {this.props.isConversationsLoaded && <MembersSidekick />}

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
