import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Main } from './Main';
import { setActiveConversationId } from '../../store/chat';

export interface Properties {
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
    this.props.setActiveConversationId({ id: this.conversationId });
  }

  componentDidUpdate(prevProps: Properties): void {
    if (this.idChanged(prevProps)) {
      this.props.setActiveConversationId({ id: this.conversationId });
    }
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
    return <Main />;
  }
}

export const MessengerMain = connectContainer<{}>(Container);
