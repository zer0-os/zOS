import * as React from 'react';

import { IconDotsHorizontal, IconPlus } from '@zero-tech/zui/icons';
import { DropdownMenu } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {}

interface State {}

export class GroupManagementMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOpenChange = () => {};

  renderMenuItem(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  // Update menuItems to add new menu items
  get renderDropdownMenuItems() {
    const menuItems = [
      {
        id: 'example_id',
        label: this.renderMenuItem(<IconPlus />, 'Example Item'),
        onSelect: () => {},
      },
    ];
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
