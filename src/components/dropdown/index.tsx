import React from 'react';

import { AutocompleteDropdown } from '../autocomplete-dropdown';

interface ZNSRecord {
  id: string;
  name: string;
  type: string;
}

interface ZNSDropdownProperties {
  itemContainerClassName?: string;
  api: any; //{ search: (term: string) => any };
  onSelect: (item: ZNSRecord) => void;
}

interface ZNSDropdownState {
  results: any[];
}

export class Dropdown extends React.Component<ZNSDropdownProperties, ZNSDropdownState> {
  constructor(props) {
    super(props);

    this.state = { results: [] };
  }

  findMatches = async (term: string) => {
    const api = await this.props.api;

    const results = await api.search(term);

    this.setState({ results });

    return results.map(result => {
      const { id, title, description, znsRoute } = result;

      return {
        id,
        value: title,
        summary: description,
        route: znsRoute,
      }
    });
  }

  onSelect = item => {
    this.props.onSelect(this.state.results.find(p => p.id === item.id));
  }

  render() {
    return (
      <AutocompleteDropdown
        value=''
        placeholder='Search by ZERO name address (zNA)'
        itemContainerClassName={this.props.itemContainerClassName}
        findMatches={this.findMatches}
        onSelect={this.onSelect}
        autoFocus
      />
    );
  }
}
