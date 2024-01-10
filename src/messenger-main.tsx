import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';

import { Main } from './Main';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { Provider as AuthenticationContextProvider } from './components/authentication/context';
import { setActiveConversationId, validateActiveConversation } from './store/chat';

export interface Properties {
  isAuthenticated: boolean;

  match: { params: { conversationId: string } };
  setActiveConversationId: (id: string) => void;
  validateActiveConversation: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      isAuthenticated: !!state.authentication.user?.data,
    };
  }

  static mapActions() {
    return {
      setActiveConversationId,
      validateActiveConversation,
    };
  }

  componentDidMount(): void {
    this.props.setActiveConversationId(this.conversationId);
  }

  componentDidUpdate(prevProps: Properties): void {
    if (this.idChanged(prevProps)) {
      this.props.setActiveConversationId(this.conversationId);
      this.props.validateActiveConversation();
    }
  }

  get authenticationContext() {
    const { isAuthenticated } = this.props;
    return {
      isAuthenticated,
    };
  }

  get conversationId() {
    return this.idFrom(this.props);
  }

  idChanged(prevProps: Properties) {
    return this.idFrom(prevProps) !== this.conversationId;
  }

  idFrom(props: Properties) {
    return props.match?.params?.conversationId || '';
  }

  render() {
    return (
      <>
        <AuthenticationContextProvider value={this.authenticationContext}>
          <ZUIProvider>
            <Main />
          </ZUIProvider>
        </AuthenticationContextProvider>
      </>
    );
  }
}

export const MessengerMain = connectContainer<{}>(Container);
