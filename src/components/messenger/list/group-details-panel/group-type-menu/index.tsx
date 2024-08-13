import * as React from 'react';

import { IconInfoCircle, IconLock1, IconMonitor2, IconUsers1 } from '@zero-tech/zui/icons';
import { featureFlags } from '../../../../../lib/feature-flags';
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

    featureFlags.enableChannels &&
      menuItems.push({
        id: 'social-channel',
        label: this.renderMenuItem(<IconMonitor2 size={20} />, 'Social Channel'),
        onSelect: () => this.selectType(GroupType.SOCIAL),
      });

    return menuItems;
  }

  render() {
    const { selectedGroupType } = this.state;
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
            value={selectedGroupType}
            itemSize='compact'
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
