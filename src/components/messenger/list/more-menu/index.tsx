import React from 'react';

import { DropdownMenu } from '@zero-tech/zui/components';
import { IconBookmark, IconBookmarkX, IconDotsHorizontal } from '@zero-tech/zui/icons';

import './styles.scss';

export interface Properties {
  isFavorite: boolean;
  onFavorite: () => void;
}

export class MoreMenu extends React.Component<Properties> {
  favorite = () => {
    this.props.onFavorite();
  };

  renderMenuOption(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  get menuItems() {
    return [
      {
        id: 'favorite',
        label: this.props.isFavorite
          ? this.renderMenuOption(<IconBookmark size={20} />, 'Favorite')
          : this.renderMenuOption(<IconBookmarkX size={20} />, 'Unfavorite'),
        onSelect: this.props.onFavorite,
      },
    ];
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
