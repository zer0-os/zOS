import * as React from 'react';

import { Button } from '@zero-tech/zui/components';

import { Option } from '../autocomplete-members';
import { PanelHeader } from './panel-header';
import { SelectedUserTag } from './selected-user-tag';

import { bem } from '../../../lib/bem';
const c = bem('group-details-panel');

export interface Properties {
  users: Option[];

  onBack: () => void;
  onCreate: (data: { users: Option[] }) => void;
}

export class GroupDetailsPanel extends React.Component<Properties> {
  createGroup = () => {
    this.props.onCreate({ users: this.props.users });
  };

  render() {
    return (
      <>
        <PanelHeader title='Group details' onBack={this.props.onBack} />
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
