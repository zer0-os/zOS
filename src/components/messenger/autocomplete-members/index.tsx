import React from 'react';

import { Avatar } from '@zero-tech/zui/components/Avatar';
import { Input } from '@zero-tech/zui/components/Input';

import './styles.scss';
import { IconSearchMd } from '@zero-tech/zui/components/Icons/icons/IconSearchMd';

export interface Properties {
  search: (query: string) => Promise<Item[]>;
  onSelect: (id: string) => void;
}

interface State {
  results: Option[];
  searchString: string;
}

export interface Item {
  id: string;
  name: string;
  image?: string;
}

export interface Option {
  value: string;
  label: string;
  image?: string;
}

export class AutocompleteMembers extends React.Component<Properties, State> {
  state = { results: null, searchString: '' };

  itemToOption = (item: Item): Option => {
    return {
      value: item.id,
      label: item.name,
      image: item.image,
    };
  };

  searchChanged = async (searchString: string) => {
    this.setState({ searchString });
    if (!searchString) {
      return this.setState({ results: null });
    }

    const items = await this.props.search(searchString);

    this.setState({ results: items.map(this.itemToOption) });
  };

  itemClicked = (event: any) => {
    this.props.onSelect(event.currentTarget.dataset.id);
  };

  render() {
    return (
      <>
        <Input
          autoFocus
          type='search'
          placeholder='Search for a person'
          onChange={this.searchChanged}
          value={this.state.searchString}
          startEnhancer={<IconSearchMd size={18} />}
          wrapperClassName={'autocomplete-members__search-wrapper'}
          inputClassName={'autocomplete-members__search-input'}
        />
        {this.props.children}
        <div className='autocomplete-members__content'>
          {this.state.results && this.state.results.length > 0 && (
            <div className='autocomplete-members__search-results'>
              {this.state.results.map((r) => (
                <div
                  key={r.value}
                  data-id={r.value}
                  onClick={this.itemClicked}
                >
                  <Avatar
                    size='regular'
                    type='circle'
                    imageURL={r.image}
                  />
                  <div>{r.label}</div>
                </div>
              ))}
            </div>
          )}
          {this.state.results && this.state.results.length === 0 && (
            <div className='autocomplete-members__empty-results'>No citizens found</div>
          )}
        </div>
      </>
    );
  }
}
