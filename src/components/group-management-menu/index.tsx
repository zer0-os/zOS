import * as React from 'react';

import { featureFlags } from '../../lib/feature-flags';

import { IconDotsHorizontal, IconPlus, IconUserRight1 } from '@zero-tech/zui/icons';
import { DropdownMenu } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  isRoomAdmin: boolean;
  onStartAddMember: () => void;
  onLeave: () => void;
}

interface State { }

export class GroupManagementMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOpenChange = () => { };

  startAddMember = (_e) => {
    this.props.onStartAddMember();
  };

  renderMenuItem(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  get renderDropdownMenuItems() {
    const menuItems = [
      {
        id: 'leave_group',
        label: this.renderMenuItem(<IconUserRight1 />, 'Leave Group'),
        onSelect: () => {
          this.props.onLeave();
        },
      },
    ];

    if (featureFlags.enableAddMemberToGroup && this.props.isRoomAdmin) {
      menuItems.push({
        id: 'add-member',
        label: this.renderMenuItem(<IconPlus />, 'Add Member'),
        onSelect: this.startAddMember as any,
      });
    }


    return menuItems;
  }

  render() {
    return (
      <DropdownMenu
        menuClassName={'group-management-menu'}
        items={this.renderDropdownMenuItems}
        side='bottom'
        alignMenu='end'
        onOpenChange={this.handleOpenChange}
        trigger={<IconDotsHorizontal size={24} isFilled />}
      />
    );
  }
}
