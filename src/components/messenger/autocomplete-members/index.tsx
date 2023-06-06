import React from 'react';

import { Item, Option } from '../lib/types';
import { Avatar, Input } from '@zero-tech/zui/components';

import './styles.scss';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { itemToOption } from '../lib/utils';

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
          placeholder='Search for a person'
          onChange={this.searchChanged}
          value={this.state.searchString}
          startEnhancer={<IconSearchMd size={18} />}
          wrapperClassName={'autocomplete-members__search-wrapper force-extra-specificity'}
          inputClassName={'autocomplete-members__search-input'}
        />
        {this.props.children}
        <div className='autocomplete-members__content'>
          {this.state.results && this.state.results.length > 0 && (
            <div className='autocomplete-members__search-results'>
              {this.state.results.map((r) => (
                <div key={r.value} data-id={r.value} onClick={this.itemClicked}>
                  <Avatar size='regular' type='circle' imageURL={r.image} />
                  <div>{r.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}
