import * as React from 'react';

import { Button, Image } from '@zero-tech/zui/components';
import { IconUsers1 } from '@zero-tech/zui/icons';

import { PanelHeader } from '../panel-header';
import { User } from '../../../../store/channels';
import { bemClassName } from '../../../../lib/bem';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';

import './styles.scss';

const cn = bemClassName('view-group-information-panel');

export interface Properties {
  name: string;
  icon: string;
  currentUser: User;
  otherMembers: User[];
  isCurrentUserRoomAdmin: boolean;

  onEdit?: () => void;
  onBack: () => void;
}

export class ViewGroupInformationPanel extends React.Component<Properties> {
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

        {this.props.isCurrentUserRoomAdmin && (
          <Button {...cn('edit-group-button')} onPress={this.props.onEdit} variant='text'>
            Edit
          </Button>
        )}
      </div>
    );
  };

  renderMembers = () => {
    const { otherMembers } = this.props;
    return (
      <div {...cn('members')}>
        <div {...cn('member-header')}>
          <span>{otherMembers.length + 1}</span> member{otherMembers.length + 1 === 1 ? '' : 's'}
        </div>
        <div {...cn('member-list')}>
          <ScrollbarContainer>
            <CitizenListItem user={this.props.currentUser} tag='admin'></CitizenListItem>
            {otherMembers.map((u) => (
              <CitizenListItem key={u.userId} user={u}></CitizenListItem>
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
