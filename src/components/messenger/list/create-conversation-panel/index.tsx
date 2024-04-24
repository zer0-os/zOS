import * as React from 'react';

import { AutocompleteMembers } from '../../autocomplete-members';
import { PanelHeader } from '../panel-header';
import { SelectedUserTag } from '../selected-user-tag';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconPlus } from '@zero-tech/zui/icons';

import { Option } from '../../lib/types';
import { bemClassName } from '../../../../lib/bem';

import './create-conversation-panel.scss';

const cn = bemClassName('create-conversation');

export interface Properties {
  initialSelections: Option[];
  isSubmitting: boolean;

  search: (input: string) => any;
  onBack: () => void;
  onCreateOneOnOne: (id: string) => void;
  onStartGroup: (options: Option[]) => void;
  onOpenInviteDialog: () => void;
}

interface State {
  selectedOptions: Option[];
  isInviteDialogOpen: boolean;
  isSearching: boolean;
}

export default class CreateConversationPanel extends React.Component<Properties, State> {
  inputRef = React.createRef<HTMLInputElement>();

  constructor(props) {
    super(props);
    this.state = { selectedOptions: [...props.initialSelections], isInviteDialogOpen: false, isSearching: false };
  }

  selectOption = (selectedOption) => {
    const { selectedOptions } = this.state;
    if (!selectedOptions.some((option) => option.value === selectedOption.value)) {
      this.setState({ selectedOptions: [...selectedOptions, selectedOption], isSearching: false });
    }
  };

  unselectOption = (value) => {
    this.setState((prevState) => ({
      selectedOptions: prevState.selectedOptions.filter((option) => option.value !== value),
    }));
  };

  submitSelectedOptions = () => {
    const { selectedOptions } = this.state;
    selectedOptions.length === 1
      ? this.props.onCreateOneOnOne(selectedOptions[0].value)
      : this.props.onStartGroup(selectedOptions);
  };

  openInviteDialog = () => {
    this.props.onOpenInviteDialog();
  };

  onSearchChange = (isSearching: boolean) => {
    this.setState({ isSearching });
  };

  get isSubmitDisabled() {
    return this.state.selectedOptions.length === 0;
  }

  get submitButtonText() {
    return this.state.selectedOptions.length === 1 ? 'Create Conversation' : 'Next';
  }

  renderSelectedUserTags(selectedOptions) {
    return (
      <>
        <div {...cn('selected-users')}>
          <span {...cn('selected-number')}>{selectedOptions.length}</span> member
          {selectedOptions.length === 1 ? '' : 's'} selected
        </div>
        <div {...cn('selected-tags')}>
          {selectedOptions.map((option) => (
            <SelectedUserTag
              key={option.value}
              userOption={option}
              onRemove={this.unselectOption}
              tagSize='spacious'
              inputRef={this.inputRef}
            />
          ))}
        </div>
      </>
    );
  }

  renderInviteButton() {
    return (
      <Button
        {...cn('invite-button')}
        variant={ButtonVariant.Secondary}
        onPress={this.openInviteDialog}
        startEnhancer={<IconPlus size={25} isFilled />}
      >
        Invite Friend
      </Button>
    );
  }

  renderSubmitButton() {
    return (
      <div {...cn('submit-button-container')}>
        <Button
          {...cn('submit-button')}
          onPress={this.submitSelectedOptions}
          isDisabled={this.isSubmitDisabled}
          isLoading={this.props.isSubmitting}
        >
          {this.submitButtonText}
        </Button>
      </div>
    );
  }

  render() {
    const { selectedOptions, isSearching } = this.state;
    const hasSelectedOptions = selectedOptions.length > 0;

    return (
      <>
        <PanelHeader title='New Conversation' onBack={this.props.onBack} />
        <div {...cn('search')}>
          <AutocompleteMembers
            inputRef={this.inputRef}
            search={this.props.search}
            onSelect={this.selectOption}
            selectedOptions={selectedOptions}
            onSearchChange={this.onSearchChange}
          >
            {!isSearching && hasSelectedOptions && this.renderSelectedUserTags(selectedOptions)}
            {!isSearching && !hasSelectedOptions && this.renderInviteButton()}
          </AutocompleteMembers>
        </div>

        {!isSearching && hasSelectedOptions && this.renderSubmitButton()}
      </>
    );
  }
}
