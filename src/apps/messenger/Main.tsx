import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { withContext as withAuthenticationContext } from '../../components/authentication/context';
import { MessengerChat } from '../../components/messenger/chat';
import { DevPanelContainer } from '../../components/dev-panel/container';
import { FeatureFlag } from '../../components/feature-flag';
import { JoiningConversationDialog } from '../../components/joining-conversation-dialog';
import { ConversationsSidekick } from '../../components/sidekick-new/variants/conversations-sidekick';
import { MembersSidekick } from '../../components/sidekick-new/variants/members-sidekick';

import styles from './Main.module.scss';

export interface Properties {
  context: {
    isAuthenticated: boolean;
  };
  isValidConversation: boolean;
  isJoiningConversation: boolean;
  isConversationsLoaded: boolean;
  isSecondarySidekickOpen: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      chat: { activeConversationId, isJoiningConversation, isConversationsLoaded },
      groupManagement: { isSecondarySidekickOpen },
    } = state;

    return {
      isValidConversation: !!activeConversationId,
      isJoiningConversation,
      isConversationsLoaded,
      isSecondarySidekickOpen,
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
              {this.props.isJoiningConversation && !this.props.isValidConversation && <JoiningConversationDialog />}

              {this.props.isConversationsLoaded && this.props.isValidConversation && <MessengerChat />}
            </div>
            {this.props.isConversationsLoaded && this.props.isSecondarySidekickOpen && <MembersSidekick />}

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
