import * as React from 'react';

import { Header } from '../../header';
import { User } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { featureFlags } from '../../../lib/feature-flags';
import { lastSeenText } from '../list/utils/utils';

export interface Properties {
  className?: string;
  isOneOnOne: boolean;
  otherMembers: User[];
  name: string;
}

export class ConversationHeader extends React.Component<Properties> {
  renderSubTitle() {
    if (!this.props.isOneOnOne) {
      return undefined;
    }

    const member = this.props.otherMembers?.[0];
    if (!member) {
      return undefined;
    }

    const subHandle = member.displaySubHandle;
    const presenceText = featureFlags.enablePresence ? this.getPresenceText(member) : '';

    if (subHandle && presenceText) {
      return `${subHandle} | ${presenceText}`;
    }

    if (subHandle) {
      return subHandle;
    }

    if (presenceText) {
      return presenceText;
    }

    return undefined;
  }

  renderTitle() {
    const { otherMembers, name } = this.props;

    if (!name && !otherMembers) return '';

    const otherMembersString = otherMembersToString(otherMembers);

    return <div>{name || otherMembersString}</div>;
  }

  render() {
    return <Header title={this.renderTitle()} subtitle={this.renderSubTitle()} className={this.props.className} />;
  }

  private getPresenceText(member: User) {
    const text = lastSeenText(member);
    if (!text) {
      return '';
    }

    return text.toLowerCase();
  }
}
