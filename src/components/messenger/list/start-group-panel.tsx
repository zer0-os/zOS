import * as React from 'react';

import { Button } from '@zero-tech/zui/components';

import { AutocompleteMembers, Option } from '../autocomplete-members';
import { PanelHeader } from './panel-header';
import { SelectedUserTag } from './selected-user-tag';

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
        <div className='start-group-panel__search'>
          <AutocompleteMembers search={this.props.searchUsers} onSelect={this.selectOption}>
            <div className='start-group-panel__selected-count'>
              <span className='start-group-panel__selected-number'>{this.state.selectedOptions.length}</span> member
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
          className='start-group-panel__continue'
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
