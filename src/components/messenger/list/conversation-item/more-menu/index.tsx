import React from 'react';

import { DropdownMenu } from '@zero-tech/zui/components';
import { IconBookmark, IconBookmarkX } from '@zero-tech/zui/icons';
import { DefaultRoomLabels } from '../../../../../store/channels';

import './styles.scss';

export interface Properties {
  labels: string[];
  isOpen: boolean;

  onClose: (isOpen: boolean) => void;
  onAddLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

export class MoreMenu extends React.Component<Properties> {
  addLabel = (label) => () => {
    this.props.onAddLabel(label);
  };

  removeLabel = (label) => () => {
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
    const labelsMap = {
      [DefaultRoomLabels.WORK]: 'Work',
      [DefaultRoomLabels.FAMILY]: 'Family',
      [DefaultRoomLabels.SOCIAL]: 'Social',
      [DefaultRoomLabels.ARCHIVED]: 'Archived',
    };

    const menuItems = [];

    if (this.props.labels?.includes(DefaultRoomLabels.ARCHIVED)) {
      menuItems.push({
        id: 'unarchive',
        label: this.renderMenuOption(<IconBookmarkX size={20} />, 'Unarchive chat'),
        onSelect: this.removeLabel(DefaultRoomLabels.ARCHIVED),
      });
      return menuItems;
    }

    if (this.props.labels?.includes(DefaultRoomLabels.FAVORITE)) {
      menuItems.push({
        id: 'unfavorite',
        label: this.renderMenuOption(<IconBookmarkX size={20} />, 'Unfavorite'),
        onSelect: this.removeLabel(DefaultRoomLabels.FAVORITE),
      });
    } else {
      menuItems.push({
        id: 'favorite',
        label: this.renderMenuOption(<IconBookmark size={20} />, 'Favorite'),
        onSelect: this.addLabel(DefaultRoomLabels.FAVORITE),
      });
    }

    Object.keys(labelsMap).forEach((label) => {
      const labelName = labelsMap[label];
      if (this.props.labels?.includes(label)) {
        menuItems.push({
          id: `remove-${label.toLowerCase()}`,
          label: this.renderMenuOption(<IconBookmarkX size={20} />, `Remove from ${labelName}`),
          onSelect: this.removeLabel(label),
        });
      } else {
        menuItems.push({
          id: `add-${label.toLowerCase()}`,
          label: this.renderMenuOption(
            <IconBookmark size={20} />,
            label === DefaultRoomLabels.ARCHIVED ? 'Archive chat' : `Add to ${labelName}`
          ),
          onSelect: this.addLabel(label),
        });
      }
    });

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
