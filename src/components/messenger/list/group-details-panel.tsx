import * as React from 'react';

import { Button, Input } from '@zero-tech/zui/components';

import { Option } from '../autocomplete-members';
import { PanelHeader } from './panel-header';
import { SelectedUserTag } from './selected-user-tag';

import { bem } from '../../../lib/bem';
const c = bem('group-details-panel');

export interface Properties {
  users: Option[];

  onBack: () => void;
  onCreate: (data: { name: string; users: Option[] }) => void;
}

interface State {
  name: string;
}

export class GroupDetailsPanel extends React.Component<Properties, State> {
  state = { name: '' };

  createGroup = () => {
    this.props.onCreate({ name: this.state.name, users: this.props.users });
  };

  nameChanged = (value) => {
    this.setState({ name: value });
  };

  render() {
    return (
      <>
        <PanelHeader title='Group details' onBack={this.props.onBack} />
        <div>
          <div className={c('field-info')}>
            <span className={c('label')}>Group name</span>
            <span className={c('optional')}>Optional</span>
          </div>
          <Input value={this.state.name} onChange={this.nameChanged} />
        </div>
        <div className={c('selected-count')}>
          <span className={c('selected-number')}>{this.props.users.length}</span> member
          {this.props.users.length === 1 ? '' : 's'} selected
        </div>
        <div>
          {this.props.users.map((u) => (
            <SelectedUserTag userOption={u} key={u.value}></SelectedUserTag>
          ))}
        </div>
        <Button onPress={this.createGroup} className={c('create')}>
          Create Group
        </Button>
      </>
    );
  }
}
