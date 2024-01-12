import * as React from 'react';

import { Image } from '@zero-tech/zui/components';
import { IconUsers1 } from '@zero-tech/zui/icons';

import { PanelHeader } from '../panel-header';
import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { isUserAdmin, sortMembers } from '../utils/utils';

import './styles.scss';

const cn = bemClassName('view-group-information-panel');

export interface Properties {
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  conversationAdminIds: string[];

  onBack: () => void;
}

export class ViewGroupInformationPanel extends React.Component<Properties> {
  getTagForUser(user: User) {
    return isUserAdmin(user, this.props.conversationAdminIds) ? 'Admin' : null;
  }

  renderImage = () => {
    return (
      <div {...cn('details')}>
        <div {...cn('image')}>
          {this.props.icon ? (
            <Image {...cn('custom-group-icon')} src={this.props.icon} alt='Custom Group Icon' />
          ) : (
            <div {...cn('default-group-icon')}>
              <IconUsers1 size={60} />
            </div>
          )}
        </div>

        {this.props.name && <div {...cn('group-name')}>{this.props.name}</div>}
      </div>
    );
  };

  renderMembers = () => {
    const { otherMembers, conversationAdminIds } = this.props;
    const sortedOtherMembers = sortMembers(otherMembers, conversationAdminIds);

    return (
      <div {...cn('members')}>
        <div {...cn('member-header')}>
          <span>{otherMembers.length + 1}</span> member{otherMembers.length + 1 === 1 ? '' : 's'}
        </div>
        <div {...cn('member-list')}>
          <ScrollbarContainer>
            <CitizenListItem
              user={this.props.currentUser}
              tag={this.getTagForUser(this.props.currentUser)}
            ></CitizenListItem>
            {sortedOtherMembers.map((u) => (
              <CitizenListItem key={u.userId} user={u} tag={this.getTagForUser(u)}></CitizenListItem>
            ))}
          </ScrollbarContainer>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <PanelHeader title={'Group Info'} onBack={this.props.onBack} />
        <div {...cn('body')}>
          {this.renderImage()}
          {this.renderMembers()}
        </div>
      </div>
    );
  }
}
