import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Main } from './Main';
import { setActiveConversationId } from '../../store/chat';

export interface Properties {
  // eslint-disable-next-line react-redux/no-unused-prop-types
  match: { params: { conversationId: string } };
  setActiveConversationId: ({ id }: { id: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions() {
    return {
      setActiveConversationId,
    };
  }

  componentDidMount(): void {
    const id = this.conversationId;
    // If there is a conversation id in the URL, validate that conversation.
    // Otherwise trigger the default selection flow (openFirstConversation)
    // by dispatching an empty id once on mount.
    this.props.setActiveConversationId({ id: id ?? '' });
  }

  componentDidUpdate(prevProps: Properties): void {
    if (this.idChanged(prevProps)) {
      const id = this.conversationId;
      if (id) {
        this.props.setActiveConversationId({ id });
      }
    }
  }

  get conversationId() {
    return this.idFrom(this.props);
  }

  idChanged(prevProps: Properties) {
    return this.idFrom(prevProps) !== this.conversationId;
  }

  idFrom(props: Properties) {
    const id = props.match?.params?.conversationId;
    return id || undefined;
  }

  render() {
    return <Main />;
  }
}

export const MessengerMain = connectContainer<{}>(Container);
