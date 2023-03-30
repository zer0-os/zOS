import * as React from 'react';

import { Avatar } from '@zero-tech/zui/components';

import { AutocompleteMembers, Option } from '../autocomplete-members';
import { IconXClose } from '@zero-tech/zui/icons';

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
        <div className='start-group-panel'>
          <span>
            <i
              className='start-group-panel__back'
              onClick={this.props.onBack}
            />
            Select members
          </span>
        </div>
        <AutocompleteMembers
          search={this.props.searchUsers}
          onSelect={this.selectOption}
        >
          <div className=''>
            <span className='start-group-panel__selected-count'>
              {this.state.selectedOptions.length} member{this.state.selectedOptions.length === 1 ? '' : 's'} selected
            </span>
            {this.state.selectedOptions.map((val) => (
              <div key={val.value}>
                <Avatar
                  size={'small'}
                  type={'circle'}
                  imageURL={val.image}
                />
                <span className='start-group-panel__user-label'>{val.label}</span>
                <button
                  onClick={this.unselectOption}
                  className='start-group-panel__user-remove'
                >
                  <IconXClose data-value={val.value} />
                </button>
              </div>
            ))}
          </div>
        </AutocompleteMembers>
        <button
          className='start-group-panel__continue'
          onClick={this.continue}
          disabled={this.isContinueDisabled}
        >
          Continue
        </button>
      </>
    );
  }
}
