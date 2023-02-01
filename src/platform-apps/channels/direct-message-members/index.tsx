import React from 'react';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store';
import { DirectMessage } from '../../../store/direct-messages/types';
import { User } from '../../../store/channels';
import { fetch as fetchDirectMessages, setActiveDirectMessageId } from '../../../store/direct-messages';
import Tooltip from '../../../components/tooltip';

import './styles.scss';

export interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  setActiveDirectMessage: (channelId: string) => void;
  directMessages: DirectMessage[];
  fetchDirectMessages: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      directMessages: { list },
    } = state;

    return {
      directMessages: list,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setActiveDirectMessage: setActiveDirectMessageId, fetchDirectMessages };
  }

  componentDidMount(): void {
    this.props.fetchDirectMessages();
  }

  handleMemberClick(directMessageId: string): void {
    this.props.setActiveDirectMessage(directMessageId);
  }

  renderMemberName(members: User[]): string {
    return members
      .map((member) =>
        [
          member.firstName,
          member.lastName,
        ].join(' ')
      )
      .join(', ')
      .trim();
  }

  tooltipContent(directMessage: DirectMessage): string {
    return this.renderMemberName(directMessage.otherMembers);
  }

  renderMember = (directMessage: DirectMessage): JSX.Element => {
    return (
      <Tooltip
        placement='left'
        overlay={this.renderMemberName(directMessage.otherMembers)}
        align={{
          offset: [
            10,
            0,
          ],
        }}
        className='direct-message-members__user-tooltip'
        key={directMessage.id}
      >
        <div
          className='direct-message-members__user'
          onClick={this.handleMemberClick.bind(this, directMessage.id)}
          key={directMessage.id}
        >
          <div className='direct-message-members__user-status'></div>
          <div className='direct-message-members__user-name'>
            {directMessage.name || this.renderMemberName(directMessage.otherMembers)}
          </div>
        </div>
      </Tooltip>
    );
  };

  render() {
    return <div className='direct-message-members'>{this.props.directMessages.map(this.renderMember)}</div>;
  }
}

export const DirectMessageMembers = connectContainer<PublicProperties>(Container);
