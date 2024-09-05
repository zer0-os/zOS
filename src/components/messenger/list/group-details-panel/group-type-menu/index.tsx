import * as React from 'react';

import { IconInfoCircle, IconLock1, IconUsers1 } from '@zero-tech/zui/icons';
import { IconButton, SelectInput } from '@zero-tech/zui/components';
import { GroupType } from '..';

import { bemClassName } from '../../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('group-type-menu');

export interface Properties {
  onSelect: (groupType: string) => void;
  onOpen: () => void;
}

interface State {
  selectedGroupType: string;
}

export class GroupTypeMenu extends React.Component<Properties, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedGroupType: '',
    };
  }

  selectType = (type) => {
    this.setState({ selectedGroupType: type });
    this.props.onSelect(type);
  };

  open = () => {
    this.props.onOpen();
  };

  renderMenuItem(icon, label) {
    return (
      <div className={'menu-item'}>
        {icon} {label}
      </div>
    );
  }

  get menuItems() {
    const menuItems = [];

    menuItems.push({
      id: 'encrypted',
      label: this.renderMenuItem(<IconLock1 size={20} />, 'Encrypted Group'),
      onSelect: () => this.selectType(GroupType.ENCRYPTED),
    });

    menuItems.push({
      id: 'super-group',
      label: this.renderMenuItem(<IconUsers1 size={20} />, 'Super Group'),
      onSelect: () => this.selectType(GroupType.SUPER),
    });

    return menuItems;
  }

  transformGroupType = (type: string): string => {
    switch (type) {
      case GroupType.ENCRYPTED:
        return 'Encrypted Group';
      case GroupType.SUPER:
        return 'Super Group';
      default:
        return '';
    }
  };

  render() {
    const { selectedGroupType } = this.state;
    const transformedGroupType = this.transformGroupType(selectedGroupType);
    const items = this.menuItems;

    if (items.length === 0) {
      return null;
    }

    return (
      <div {...cn('')}>
        <div {...cn('select-input-container')}>
          <SelectInput
            items={items}
            placeholder='Group Type (Required)'
            label=''
            value={transformedGroupType}
            itemSize='compact'
            menuClassName='group-type-menu__dropdown'
          />
        </div>
        <div {...cn('select-input-label-container')} onClick={this.open}>
          Click here for more information
          <IconButton {...cn('icon-button')} Icon={IconInfoCircle} size={24} isFilled onClick={this.open} />
        </div>
      </div>
    );
  }
}
