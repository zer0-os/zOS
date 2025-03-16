import * as React from 'react';

import { Header } from '../../header';
import { User } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';

export interface Properties {
  className?: string;
  isOneOnOne: boolean;
  otherMembers: User[];
  name: string;
}

export class ConversationHeader extends React.Component<Properties> {
  isOneOnOne() {
    return this.props.isOneOnOne;
  }

  renderSubTitle() {
    if (!this.props.otherMembers || this.props.otherMembers.length === 0) {
      return '';
    }

    const member = this.props.otherMembers[0];

    if (this.isOneOnOne() && member) {
      return `${member.displaySubHandle || ''}`;
    }
  }

  renderTitle() {
    const { otherMembers, name } = this.props;

    if (!name && !otherMembers) return '';

    const otherMembersString = otherMembersToString(otherMembers);

    return <div>{name || otherMembersString}</div>;
  }

  render() {
    return <Header title={this.renderTitle()} className={this.props.className} />;
  }
}
