import * as React from 'react';

import { Header } from '../../header';
import { User } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { Avatar } from '@zero-tech/zui/components/Avatar';

export interface Properties {
  className?: string;
  isOneOnOne: boolean;
  otherMembers: User[];
  name: string;

  toggleSecondarySidekick: () => void;
}

export class ConversationHeader extends React.Component<Properties> {
  toggleSidekick = () => {
    this.props.toggleSecondarySidekick();
  };

  isOneOnOne() {
    return this.props.isOneOnOne;
  }

  avatarUrl() {
    if (!this.props.otherMembers) {
      return '';
    }

    if (this.isOneOnOne() && this.props.otherMembers[0]) {
      return this.props.otherMembers[0].profileImage;
    }

    return '';
  }

  renderAvatar() {
    return <Avatar size={'medium'} imageURL={this.avatarUrl()} tabIndex={-1} isRaised isGroup={!this.isOneOnOne()} />;
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
    return <Header title={this.renderTitle()} onClick={this.toggleSidekick} className={this.props.className} />;
  }
}
