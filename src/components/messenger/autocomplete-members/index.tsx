import React from 'react';

import { Item, Option } from '../lib/types';
import { Avatar, Input } from '@zero-tech/zui/components';

import './styles.scss';
import '../list/styles.scss';

import { highlightFilter, itemToOption } from '../lib/utils';
import classNames from 'classnames';
export interface Properties {
  inputRef?: React.RefObject<HTMLInputElement>;
  search: (query: string) => Promise<Item[]>;
  selectedOptions?: Option[];
  onSelect: (selected: Option) => void;
  onSearchChange?: (isSearching: boolean) => void;
}

interface State {
  results: Option[];
  searchString: string;
}

export class AutocompleteMembers extends React.Component<Properties, State> {
  state = { results: null, searchString: '' };

  searchChanged = async (searchString: string) => {
    this.setState({ searchString });

    this.props.onSearchChange && this.props.onSearchChange?.(!!searchString);

    if (!searchString) {
      return this.setState({ results: null });
    }

    const items = await this.props.search(searchString);
    const options = items.map(itemToOption);
    const selectedOptions = this.props.selectedOptions || [];
    const filteredOptions = options.filter((o) => !selectedOptions.find((s) => s.value === o.value));
    this.setState({ results: filteredOptions });
  };

  itemSelected = (event) => {
    const clickedId = event.currentTarget.dataset.id;
    const selectedUser = this.state.results.find((r) => r.value === clickedId);

    if (selectedUser) {
      this.props.onSelect(selectedUser);
      this.setState({ results: null, searchString: '' });
      this.props.onSearchChange && this.props.onSearchChange(false);
      if (this.props.inputRef?.current) {
        this.props.inputRef.current.focus();
      }
    }
  };

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
          ref={this.props.inputRef}
          autoFocus
          type='search'
          size={'small'}
          placeholder='Search members'
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

                  <div className='autocomplete-members__user-details'>
                    <div className='autocomplete-members__label'>
                      {highlightFilter(r.label, this.state.searchString)}
                    </div>
                    {r?.subLabel && <div className='autocomplete-members__sub-label'>{r.subLabel}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
