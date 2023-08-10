import * as React from 'react';

import { Button } from '@zero-tech/zui/components';

import { Option } from '../../lib/types';

import { AutocompleteMembers } from '../../autocomplete-members';
import { PanelHeader } from '../panel-header';
import { SelectedUserTag } from '../selected-user-tag';

import { bemClassName } from '../../../../lib/bem';
import './start-group-panel.scss';

const cn = bemClassName('start-group-panel');

export interface Properties {
  initialSelections: Option[];
  isContinuing: boolean;

  searchUsers: (input: string) => any;

  onBack: () => void;
  onContinue: (options: Option[]) => void;
}

interface State {
  selectedOptions: Option[];
}

export class StartGroupPanel extends React.Component<Properties, State> {
  state = { selectedOptions: [] };

  constructor(props) {
    super(props);
    this.state = { selectedOptions: [...props.initialSelections] };
  }

  continue = () => {
    this.props.onContinue(this.state.selectedOptions);
  };

  selectOption = (selectedOption) => {
    if (this.state.selectedOptions.find((o) => o.value === selectedOption.value)) {
      return;
    }

    this.setState({
      selectedOptions: [
        ...this.state.selectedOptions,
        selectedOption,
      ],
    });
  };

  unselectOption = (value: string) => {
    this.setState({
      selectedOptions: this.state.selectedOptions.filter((o) => o.value !== value),
    });
  };

  get isContinueDisabled() {
    return this.state.selectedOptions.length <= 0;
  }

  render() {
    return (
      <>
        <PanelHeader title='Select members' onBack={this.props.onBack} />
        <div {...cn('search')}>
          <AutocompleteMembers search={this.props.searchUsers} onSelect={this.selectOption}>
            <div {...cn('selected-count')}>
              <span {...cn('selected-number')}>{this.state.selectedOptions.length}</span> member
              {this.state.selectedOptions.length === 1 ? '' : 's'} selected
            </div>
            <div>
              {this.state.selectedOptions.map((option) => (
                <SelectedUserTag key={option.value} userOption={option} onRemove={this.unselectOption} />
              ))}
            </div>
          </AutocompleteMembers>
        </div>
        <Button
          {...cn('continue')}
          onPress={this.continue}
          isDisabled={this.isContinueDisabled}
          isLoading={this.props.isContinuing}
        >
          Continue
        </Button>
      </>
    );
  }
}
