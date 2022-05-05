import React from 'react';

import { AutocompleteDropdown, AutocompleteItem } from '../autocomplete-dropdown';

interface ZNSRecord {
  id: string;
  title: string;
  description?: string;
  znsRoute: string;
}

export interface Properties {
  itemContainerClassName?: string;
  api: { search: (term: string) => any };
  onSelect: (route: string) => void;
}

interface State {
  results: ZNSRecord[];
}

export class ZNSDropdown extends React.Component<Properties, State> {
  constructor(props) {
    super(props);

    this.state = { results: [] };
  }

  findMatches = async (term: string) => {
    const api = await this.props.api;

    const results: ZNSRecord[] = await api.search(term);

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

  onSelect = (item: AutocompleteItem) => {
    this.props.onSelect(this.state.results.find(p => p.id === item.id).znsRoute);
  }

  render() {
    return (
      <AutocompleteDropdown
        value=''
        placeholder='Search by ZERO name address (zNA)'
        itemContainerClassName={this.props.itemContainerClassName}
        findMatches={this.findMatches}
        onSelect={this.onSelect}
      />
    );
  }
}
