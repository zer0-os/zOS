import * as React from 'react';

import { Avatar, Button } from '@zero-tech/zui/components';

import { AutocompleteMembers, Option } from '../autocomplete-members';
import { IconXClose } from '@zero-tech/zui/icons';
import { PanelHeader } from './panel-header';

export interface Properties {
  searchUsers: (input: string) => any;

  onBack: () => void;
  onContinue: (ids: string[]) => void;
}

interface State {
  selectedOptions: Option[];
}

export class StartGroupPanel extends React.Component<Properties, State> {
  state = { selectedOptions: [] };

  continue = () => {
    this.props.onContinue(this.state.selectedOptions.map((o) => o.value));
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

  unselectOption = (event) => {
    const clickedValue = event.currentTarget.dataset.value;
    this.setState({
      selectedOptions: this.state.selectedOptions.filter((o) => o.value !== clickedValue),
    });
  };

  get isContinueDisabled() {
    return this.state.selectedOptions.length <= 0;
  }

  render() {
    return (
      <>
        <PanelHeader
          title='Select members'
          onBack={this.props.onBack}
        />
        <div className='start-group-panel__search'>
          <AutocompleteMembers
            search={this.props.searchUsers}
            onSelect={this.selectOption}
          >
            <div className='start-group-panel__selected-count'>
              <span className='start-group-panel__selected-number'>{this.state.selectedOptions.length}</span> member
              {this.state.selectedOptions.length === 1 ? '' : 's'} selected
            </div>
            <div className='start-group-panel__selected-options'>
              {this.state.selectedOptions.map((val) => (
                <div
                  className='start-group-panel__selected-option'
                  key={val.value}
                >
                  <div className='start-group-panel__selected-tag'>
                    <Avatar
                      size={'extra small'}
                      type={'circle'}
                      imageURL={val.image}
                    />
                    <span className='start-group-panel__user-label'>{val.label}</span>
                    <button
                      onClick={this.unselectOption}
                      data-value={val.value}
                      className='start-group-panel__user-remove'
                    >
                      <IconXClose size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AutocompleteMembers>
        </div>
        <Button
          className='start-group-panel__continue'
          onPress={this.continue}
          isDisabled={this.isContinueDisabled}
        >
          Continue
        </Button>
      </>
    );
  }
}
