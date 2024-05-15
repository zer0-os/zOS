import * as React from 'react';

import { IconDotsHorizontal, IconUserX1 } from '@zero-tech/zui/icons';
import { DropdownMenu } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  canRemove?: boolean;
  onOpenChange: (isOpen: boolean) => void;

  onRemoveMember: () => void;
}

export class MemberManagementMenu extends React.Component<Properties> {
  handleOpenChange = (open) => {
    this.props.onOpenChange(open);
  };

  onRemoveMember = () => {
    this.props.onRemoveMember();
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

    if (this.props.canRemove) {
      menuItems.push({
        id: 'remove-member',
        className: 'remove-member',
        label: this.renderMenuItem(<IconUserX1 size={20} />, 'Remove'),
        onSelect: this.onRemoveMember,
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
        menuClassName={'member-management-menu'}
        items={items}
        side='bottom'
        alignMenu='end'
        onOpenChange={this.handleOpenChange}
        className={'member-management-trigger'}
        trigger={<IconDotsHorizontal size={24} isFilled />}
      />
    );
  }
}
