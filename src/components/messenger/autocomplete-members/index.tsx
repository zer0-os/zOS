import React from 'react';

import { Item, Option } from '../lib/types';
import { Avatar, Input } from '@zero-tech/zui/components';

import './styles.scss';
import '../list/styles.scss';

import { highlightFilter, itemToOption } from '../lib/utils';
import classNames from 'classnames';

export interface Properties {
  search: (query: string) => Promise<Item[]>;
  onSelect: (selected: Option) => void;
}

interface State {
  results: Option[];
  searchString: string;
}

export class AutocompleteMembers extends React.Component<Properties, State> {
  state = { results: null, searchString: '' };

  searchChanged = async (searchString: string) => {
    this.setState({ searchString });
    if (!searchString) {
      return this.setState({ results: null });
    }

    const items = await this.props.search(searchString);

    this.setState({ results: items.map(itemToOption) });
  };

  itemClicked = (event: any) => {
    const clickedId = event.currentTarget.dataset.id;
    const selectedUser = this.state.results.find((r) => r.value === clickedId);
    if (selectedUser) {
      this.props.onSelect(selectedUser);
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
                <div key={r.value} data-id={r.value} onClick={this.itemClicked}>
                  <Avatar size='regular' type='circle' imageURL={r.image} />
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
