import * as React from 'react';

import { IconDotsHorizontal, IconEdit5, IconPlus, IconUserRight1 } from '@zero-tech/zui/icons';
import { DropdownMenu, IconButton } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  canAddMembers: boolean;
  canLeaveRoom: boolean;
  canEdit: boolean;
  onStartAddMember: () => void;
  onLeave: () => void;
  onEdit: () => void;
}

interface State {}

export class GroupManagementMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOpenChange = () => {};

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

  get dropdownMenuItems() {
    const menuItems = [];

    if (this.props.canAddMembers) {
      menuItems.push({
        id: 'add-member',
        label: this.renderMenuItem(<IconPlus />, 'Add Member'),
        onSelect: this.startAddMember as any,
      });
    }

    if (this.props.canLeaveRoom) {
      menuItems.push({
        id: 'leave_group',
        className: 'leave-group',
        label: this.renderMenuItem(<IconUserRight1 />, 'Leave Group'),
        onSelect: () => {
          this.props.onLeave();
        },
      });
    }

    if (this.props.canEdit) {
      menuItems.push({
        id: 'edit_group',
        label: this.renderMenuItem(<IconEdit5 />, 'Edit'),
        onSelect: this.props.onEdit,
      });
    }

    return menuItems;
  }

  render() {
    const items = this.dropdownMenuItems;
    if (items.length === 0) {
      return null;
    }
    return (
      <DropdownMenu
        menuClassName={'group-management-menu'}
        items={items}
        side='bottom'
        alignMenu='end'
        onOpenChange={this.handleOpenChange}
        trigger={<IconButton Icon={IconDotsHorizontal} size={32} isFilled onClick={() => {}} />}
      />
    );
  }
}
