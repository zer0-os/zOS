import * as React from 'react';

import { Header } from '../../header';
import { User } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';
import { subHandleWithPresence } from '../list/utils/utils';
import { MatrixAvatar } from '../../matrix-avatar';
import { getPresenceStatusType } from '../../../lib/user';
import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('conversation-header');

export interface Properties {
  className?: string;
  isOneOnOne: boolean;
  otherMembers: User[];
  name: string;
}

export class ConversationHeader extends React.Component<Properties> {
  renderSubTitle() {
    if (this.props.isOneOnOne) {
      return undefined;
    }

    // For group chats we may add a subtitle in future – none for now
    return undefined;
  }

  renderTitle() {
    const { otherMembers, name, isOneOnOne } = this.props;

    if (!name && !otherMembers) return '';

    const otherMembersString = otherMembersToString(otherMembers);
    const titleText = name || otherMembersString;

    if (isOneOnOne) {
      const member = otherMembers?.[0];

      if (member) {
        return (
          <div {...cn('title')}>
            <MatrixAvatar
              size={'small'}
              imageURL={member.profileImage}
              tabIndex={-1}
              statusType={getPresenceStatusType(member)}
            />
            <div {...cn('text-container')}>
              <span {...cn('title-text')}>{titleText}</span>
              <span {...cn('subtitle-text')}>{subHandleWithPresence(member)}</span>
            </div>
          </div>
        );
      }
    }

    return <div>{titleText}</div>;
  }

  render() {
    return <Header title={this.renderTitle()} subtitle={this.renderSubTitle()} className={this.props.className} />;
  }
}
