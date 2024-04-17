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
}

export default class CreateConversationPanel extends React.Component<Properties, State> {
  state = { selectedOptions: [], isInviteDialogOpen: false };

  constructor(props) {
    super(props);
    this.state = { selectedOptions: [...props.initialSelections], isInviteDialogOpen: false };
  }

  selectOption = (selectedOption) => {
    const { selectedOptions } = this.state;
    if (!selectedOptions.some((option) => option.value === selectedOption.value)) {
      this.setState({ selectedOptions: [...selectedOptions, selectedOption] });
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
        <div>
          {selectedOptions.map((option) => (
            <SelectedUserTag key={option.value} userOption={option} onRemove={this.unselectOption} />
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
    const { selectedOptions } = this.state;
    const hasSelectedOptions = selectedOptions.length > 0;

    return (
      <>
        <PanelHeader title='New Conversation' onBack={this.props.onBack} />
        <div {...cn('search')}>
          <AutocompleteMembers
            search={this.props.search}
            onSelect={this.selectOption}
            selectedOptions={selectedOptions}
          >
            {hasSelectedOptions && this.renderSelectedUserTags(selectedOptions)}
            {!hasSelectedOptions && this.renderInviteButton()}
          </AutocompleteMembers>
        </div>

        {hasSelectedOptions && this.renderSubmitButton()}
      </>
    );
  }
}
