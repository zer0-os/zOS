import * as React from 'react';

import { Button } from '@zero-tech/zui/components';

import { Option } from '../../lib/types';

import { AutocompleteMembers } from '../../autocomplete-members';
import { PanelHeader } from '../panel-header';
import { SelectedUserTag } from '../selected-user-tag';
import { IconAlertCircle } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('add-members-panel');

export interface Properties {
  isSubmitting: boolean;
  error: string;

  searchUsers: (input: string) => any;
  onBack: () => void;
  onSubmit: (options: Option[]) => void;
}

interface State {
  selectedOptions: Option[];
  isSearching: boolean;
}

export class AddMembersPanel extends React.Component<Properties, State> {
  inputRef = React.createRef<HTMLInputElement>();

  state = { selectedOptions: [], isSearching: false };

  constructor(props) {
    super(props);
    this.state = { selectedOptions: [], isSearching: false };
  }

  submitSelectedOptions = () => {
    this.props.onSubmit(this.state.selectedOptions);
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
      isSearching: false,
    });
  };

  unselectOption = (value: string) => {
    this.setState({
      selectedOptions: this.state.selectedOptions.filter((o) => o.value !== value),
    });
  };

  onSearchChange = (isSearching: boolean) => {
    this.setState({ isSearching });
  };

  get hasSelectedOptions() {
    return this.state.selectedOptions.length > 0;
  }

  get memberCountSuffix() {
    return this.state.selectedOptions.length >= 2 ? 's' : '';
  }

  get hasError() {
    return this.props.error;
  }

  renderSelectCount() {
    return (
      <div {...cn('selected-count')}>
        <span {...cn('selected-number')}>{this.state.selectedOptions.length}</span> member
        {this.memberCountSuffix} selected
      </div>
    );
  }

  renderSelectedUserTags() {
    return (
      <div {...cn('selected-tags')}>
        {this.state.selectedOptions.map((option) => (
          <SelectedUserTag
            key={option.value}
            userOption={option}
            onRemove={this.unselectOption}
            tagSize='spacious'
            inputRef={this.inputRef}
          />
        ))}
      </div>
    );
  }

  renderErrorMessage() {
    return (
      <div {...cn('error')}>
        <IconAlertCircle size={16} isFilled />
        <div {...cn('error-message')}>{this.props.error}</div>
      </div>
    );
  }

  renderSubmitButton() {
    return (
      <div {...cn('submit-button-container')}>
        <Button {...cn('submit-button')} onPress={this.submitSelectedOptions} isLoading={this.props.isSubmitting}>
          {`Add Member${this.memberCountSuffix}`}
        </Button>
      </div>
    );
  }

  render() {
    const { isSearching, selectedOptions } = this.state;
    const hasSelectedOptions = selectedOptions.length > 0;

    return (
      <>
        <PanelHeader title={'Add Members'} onBack={this.props.onBack} />
        <div {...cn('search')}>
          <AutocompleteMembers
            inputRef={this.inputRef}
            search={this.props.searchUsers}
            onSelect={this.selectOption}
            selectedOptions={this.state.selectedOptions}
            onSearchChange={this.onSearchChange}
          >
            {!isSearching && hasSelectedOptions && (
              <>
                {this.renderSelectCount()}
                {this.renderSelectedUserTags()}
              </>
            )}
          </AutocompleteMembers>
        </div>
        {this.hasError && this.renderErrorMessage()}
        {!isSearching && hasSelectedOptions && this.renderSubmitButton()}
      </>
    );
  }
}
