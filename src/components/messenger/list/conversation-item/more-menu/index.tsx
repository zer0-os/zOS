import React from 'react';

import { DropdownMenu } from '@zero-tech/zui/components';
import { IconBookmark, IconBookmarkX } from '@zero-tech/zui/icons';
import { RoomLabels } from '../../../../../store/channels';

import './styles.scss';

export interface Properties {
  labels: RoomLabels[];
  isOpen: boolean;

  onClose: (isOpen: boolean) => void;
  onAddLabel: (label: RoomLabels) => void;
  onRemoveLabel: (label: RoomLabels) => void;
}

export class MoreMenu extends React.Component<Properties> {
  addLabel = (label: RoomLabels) => () => {
    this.props.onAddLabel(label);
  };

  removeLabel = (label: RoomLabels) => () => {
    this.props.onRemoveLabel(label);
  };

  renderMenuOption(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  onOpenChange = (isOpening) => {
    if (!isOpening) {
      this.props.onClose(isOpening);
    }
  };

  get menuItems() {
    const menuItems = [];

    if (!this.props.labels?.includes(RoomLabels.FAVORITE)) {
      menuItems.push({
        id: 'favorite',
        label: this.renderMenuOption(<IconBookmark size={20} />, 'Favorite'),
        onSelect: this.addLabel(RoomLabels.FAVORITE),
      });
    } else {
      menuItems.push({
        id: 'unfavorite',
        label: this.renderMenuOption(<IconBookmarkX size={20} />, 'Unfavorite'),
        onSelect: this.removeLabel(RoomLabels.FAVORITE),
      });
    }

    return menuItems;
  }

  render() {
    const items = this.menuItems;
    if (items.length === 0) {
      return null;
    }

    return (
      <DropdownMenu
        items={items}
        side='bottom'
        alignMenu='start'
        trigger={<></>}
        open={this.props.isOpen}
        onOpenChange={this.onOpenChange}
      />
    );
  }
}
