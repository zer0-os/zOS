import * as React from 'react';
import { RootState } from '../../store/reducer';

import { Message } from '../../store/messages';
import { AdminMessage } from '.';
import { connectContainer } from '../../store/redux-container';
import { adminMessageText } from '../../lib/chat/chat-message';

export interface PublicProperties {
  // eslint-disable-next-line react-redux/no-unused-prop-types
  message: Message;
}

export interface Properties extends PublicProperties {
  text: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    let text = props.message.isAdmin ? adminMessageText(props.message, state) : props.message.message;

    return { text };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <AdminMessage message={this.props.text} />;
  }
}

export const AdminMessageContainer = connectContainer<PublicProperties>(Container);
