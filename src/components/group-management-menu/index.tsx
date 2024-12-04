import * as React from 'react';

import {
  IconBell1,
  IconBellOff1,
  IconEdit5,
  IconInfoCircle,
  IconPlus,
  IconUserRight1,
  IconDotsHorizontal,
  IconAlertCircle,
} from '@zero-tech/zui/icons';
import { DropdownMenu } from '@zero-tech/zui/components/DropdownMenu';

import './styles.scss';

export interface Properties {
  canAddMembers: boolean;
  canReportUser: boolean;
  canLeaveRoom: boolean;
  canEdit: boolean;
  canViewGroupInformation: boolean;
  isRoomMuted: boolean;

  onStartAddMember: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onViewGroupInformation: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onReportUser: () => void;
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

  editGroup = () => {
    this.props.onEdit();
  };

  viewGroupInformation = () => {
    this.props.onViewGroupInformation();
  };

  toggleMuteNotifications = () => {
    if (this.props.isRoomMuted) {
      this.props.onUnmute();
    } else {
      this.props.onMute();
    }
  };

  reportUser = () => {
    this.props.onReportUser();
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

    menuItems.push({
      id: 'mute_notifications',
      label: this.renderMenuItem(
        this.props.isRoomMuted ? <IconBellOff1 size={20} /> : <IconBell1 size={20} />,
        this.props.isRoomMuted ? 'Unmute Notifications' : 'Mute Notifications'
      ),
      onSelect: this.toggleMuteNotifications,
    });

    if (this.props.canAddMembers) {
      menuItems.push({
        id: 'add-member',
        label: this.renderMenuItem(<IconPlus size={20} />, 'Add Member'),
        onSelect: this.startAddMember as any,
      });
    }

    if (this.props.canViewGroupInformation) {
      menuItems.push({
        id: 'group_information',
        label: this.renderMenuItem(<IconInfoCircle size={20} />, 'Group Info'),
        onSelect: this.viewGroupInformation,
      });
    }

    if (this.props.canEdit) {
      menuItems.push({
        id: 'edit_group',
        label: this.renderMenuItem(<IconEdit5 size={20} />, 'Edit Group'),
        onSelect: this.editGroup,
      });
    }

    if (this.props.canReportUser) {
      menuItems.push({
        id: 'report_user',
        label: this.renderMenuItem(<IconAlertCircle color='red' size={20} />, 'Report User'),
        onSelect: this.reportUser,
      });
    }

    if (this.props.canLeaveRoom) {
      menuItems.push({
        id: 'leave_group',
        className: 'leave-group',
        label: this.renderMenuItem(<IconUserRight1 size={20} />, 'Leave Group'),
        onSelect: () => {
          this.props.onLeave();
        },
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
        className={'group-management-trigger'}
        trigger={<IconDotsHorizontal size={24} isFilled />}
      />
    );
  }
}
