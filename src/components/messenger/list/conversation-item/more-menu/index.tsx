import React from 'react';

import { DropdownMenu } from '@zero-tech/zui/components';
import { IconBookmark, IconBookmarkX, IconDotsHorizontal } from '@zero-tech/zui/icons';

import './styles.scss';

export interface Properties {
  isFavorite: boolean;

  onFavorite: () => void;
  onUnfavorite: () => void;
}

export class MoreMenu extends React.Component<Properties> {
  favorite = () => {
    this.props.onFavorite();
  };

  unfavorite = () => {
    this.props.onUnfavorite();
  };

  renderMenuOption(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  get menuItems() {
    const menuItems = [];

    if (!this.props.isFavorite) {
      menuItems.push({
        id: 'favorite',
        label: this.renderMenuOption(<IconBookmark size={20} />, 'Favorite'),

        onSelect: this.favorite,
      });
    } else {
      menuItems.push({
        id: 'unfavorite',
        label: this.renderMenuOption(<IconBookmarkX size={20} />, 'Unfavorite'),
        onSelect: this.unfavorite,
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
        className={'more-menu-trigger'}
        trigger={<IconDotsHorizontal size={16} isFilled />}
      />
    );
  }
}
