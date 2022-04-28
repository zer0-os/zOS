import React from 'react';

import AutocompleteDropdown from 'components/autocomplete-dropdown';

interface ZNSRecord {
  id: string;
  name: string;
  type: string;
}

interface ZNSDropdownProperties {
  itemContainerClassName?: string;
  ZNSApi: {search: (term: string) => any};
  onSelect: (item: ZNSRecord) => void;
}

interface ZNSDropdownState {
  results: any[];
}

export class Dropdown extends React.Component<ZNSDropdownProperties, ZNSDropdownState> {
  DEFAULT_IMAGE_URL = 'https://s3-us-west-2.amazonaws.com/fact0ry-themes/anon.jpg';

  constructor(props) {
    super(props);

    this.state = { results: [] };
  }

  findMatches = async (term: string) => {
    const results = await this.props.ZNSApi.search(term);

    this.setState({ results });

    return results.map(ZNS => ({
      id: ZNS.id,
      value: ZNS.name,
      summary: ZNS.summary || '',
      type: ZNS.type,
      imageUrl: ZNS.ZNSImage || this.DEFAULT_IMAGE_URL,
    }));
  }

  onSelect = item => {
    this.props.onSelect(this.state.results.find(p => p.id === item.id));
  }

  render() {
    return (
      <AutocompleteDropdown
        value=''
        placeholder='Type to search'
        itemContainerClassName={this.props.itemContainerClassName}
        findMatches={this.findMatches}
        onSelect={this.onSelect}
        autoFocus
      />
    );
  }
}
