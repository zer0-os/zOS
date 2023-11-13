import React from 'react';

import { Item, Option } from '../lib/types';
import { Avatar, Input } from '@zero-tech/zui/components';

import './styles.scss';
import '../list/styles.scss';

import { highlightFilter, itemToOption } from '../lib/utils';
import classNames from 'classnames';
import { Channel } from '../../../store/channels';
import { otherMembersToString } from '../../../platform-apps/channels/util';

export interface Properties {
  conversations?: Channel[];

  search: (query: string) => Promise<Item[]>;
  selectedOptions?: Option[];
  onSelect: (selected: Option) => void;
}

interface State {
  results: Option[];
  searchString: string;
}

export class AutocompleteMembers extends React.Component<Properties, State> {
  state = { results: null, searchString: '' };

  // filters the options to exclude any that are already in a "one2one" conversation
  getNewOptions(options) {
    const existingConversations = this.props.conversations || [];
    const names = existingConversations
      .filter((conversation) => conversation.otherMembers.length === 1)
      .map((conversation) => otherMembersToString(conversation.otherMembers));

    return options.filter((o) => !names.includes(o.label));
  }

  searchChanged = async (searchString: string) => {
    this.setState({ searchString });
    if (!searchString) {
      return this.setState({ results: null });
    }

    const items = await this.props.search(searchString);
    const options = items.map(itemToOption);
    const selectedOptions = this.props.selectedOptions || [];
    const filteredOptions = options.filter((o) => !selectedOptions.find((s) => s.value === o.value));
    const newOptions = this.getNewOptions(filteredOptions);
    this.setState({ results: newOptions });
  };

  itemSelected(event) {
    const clickedId = event.currentTarget.dataset.id;
    const selectedUser = this.state.results.find((r) => r.value === clickedId);

    if (selectedUser) {
      this.props.onSelect(selectedUser);
      // exclude selected user from results
      this.setState({
        results: this.state.results.filter((r) => r.value !== clickedId),
      });
    }
  }

  itemClicked = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.itemSelected(event);
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      this.itemSelected(event);
    }
  };

  render() {
    return (
      <div className='autocomplete-members'>
        <Input
          autoFocus
          type='search'
          size={'small'}
          placeholder='Search'
          onChange={this.searchChanged}
          value={this.state.searchString}
          wrapperClassName={'autocomplete-members__search-wrapper force-extra-specificity'}
          inputClassName={'autocomplete-members__search-input'}
        />

        {this.state.results?.length === 0 && this.state.results !== '' && (
          <div className={classNames('messages-list__empty', 'messages-list__empty-top-padding')}>
            {`No results for '${this.state.searchString}' `}
          </div>
        )}

        {this.props.children}
        <div className='autocomplete-members__content'>
          {this.state.results && this.state.results.length > 0 && (
            <div className='autocomplete-members__search-results'>
              {this.state.results.map((r) => (
                <div
                  key={r.value}
                  data-id={r.value}
                  tabIndex={0}
                  role='button'
                  onKeyDown={this.handleKeyDown}
                  onClick={this.itemClicked}
                >
                  <Avatar size='regular' type='circle' imageURL={r.image} tabIndex={-1} />
                  <div>{highlightFilter(r.label, this.state.searchString)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
