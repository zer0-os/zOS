import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';

import { Main } from './Main';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { Provider as AuthenticationContextProvider } from './components/authentication/context';
import { setactiveConversationId } from './store/chat';

export interface Properties {
  isAuthenticated: boolean;

  match: { params: { conversationId: string } };
  setactiveConversationId: (id: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      isAuthenticated: !!state.authentication.user?.data,
    };
  }

  static mapActions() {
    return {
      setactiveConversationId,
    };
  }

  componentDidMount(): void {
    this.props.setactiveConversationId(this.conversationId);
  }

  get authenticationContext() {
    const { isAuthenticated } = this.props;
    return {
      isAuthenticated,
    };
  }

  get conversationId() {
    return this.props.match?.params?.conversationId || '';
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
