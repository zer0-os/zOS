import * as React from 'react';

import { IconLock1, IconMonitor2, IconUsers1 } from '@zero-tech/zui/icons';
import { Alert, SelectInput } from '@zero-tech/zui/components';

import { bemClassName } from '../../../../../lib/bem';
import './styles.scss';
import { ALERT_MESSAGES } from './types';

const cn = bemClassName('group-type-menu');

export interface Properties {
  onSelect: (groupType: string) => void;
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
      onSelect: () => this.selectType('Encrypted Group'),
    });

    menuItems.push({
      id: 'super-group',
      label: this.renderMenuItem(<IconUsers1 size={20} />, 'Super Group'),
      onSelect: () => this.selectType('Super Group'),
    });

    menuItems.push({
      id: 'social-channel',
      label: this.renderMenuItem(<IconMonitor2 size={20} />, 'Social Channel'),
      onSelect: () => this.selectType('Social Channel'),
    });

    return menuItems;
  }

  renderAlerts() {
    const { selectedGroupType } = this.state;

    if (!selectedGroupType) {
      return (
        <Alert {...cn('alert')} variant='info'>
          Choose the Group Type that best supports your community's goals.
        </Alert>
      );
    }

    const messages = ALERT_MESSAGES[selectedGroupType] || [];

    return messages.map((message, index) => (
      <Alert key={`${selectedGroupType}-${index}`} {...cn('alert')} variant='info'>
        {message}
      </Alert>
    ));
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
          <SelectInput items={items} label='Group Type' placeholder='' value={selectedGroupType} itemSize='compact' />
        </div>

        <div {...cn('alert-container')}>{this.renderAlerts()}</div>
      </div>
    );
  }
}
