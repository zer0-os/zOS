import * as React from 'react';
import { RootState } from '../../store/reducer';

import { AdminMessageType, Message } from '../../store/messages';
import { AdminMessage } from '.';
import { denormalize as denormalizeUser } from '../../store/users';
import { currentUserSelector } from '../../store/authentication/saga';
import { connectContainer } from '../../store/redux-container';

export interface PublicProperties {
  message: Message;
}

export interface Properties extends PublicProperties {
  text: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, props: PublicProperties): Partial<Properties> {
    const user = currentUserSelector()(state);

    let text = props.message.message;
    if (props.message.admin?.type === AdminMessageType.JOINED_ZERO) {
      if (props.message.admin?.inviteeId === user.id) {
        const inviter = denormalizeUser(props.message.admin.inviterId, state);
        text = inviter?.firstName ? `You joined ${inviter.firstName} on Zero` : text;
      } else {
        const invitee = denormalizeUser(props.message.admin.inviteeId, state);
        text = invitee?.firstName ? `${invitee.firstName} joined you on Zero` : text;
      }
    }

    return {
      text,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <AdminMessage message={this.props.text} createdAt={this.props.message.createdAt} />;
  }
}

export const AdminMessageContainer = connectContainer<PublicProperties>(Container);
