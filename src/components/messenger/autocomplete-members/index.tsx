import React from 'react';
import classNames from 'classnames';
import isEqual from 'lodash.isequal';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import { Option as CustomOptionComponent } from './option';

import './styles.scss';

export interface Properties {
  className?: string;
  selectedItems: Item[];
  search: (query: string, networkId?: string) => Promise<Item[]>;
  networkId?: string;
  placeholder?: string;
  noResultsText?: string;
  isMulti?: boolean;
  autoFocus?: boolean;
  name?: string;
  includeImage?: boolean;
  filterOptions?: (options: any[], filterValue: string) => any[];

  onChange: (ids: string[]) => void;
}

interface State {
  networkId: string;
  currentSelection: Option | Option[];
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
  constructor(props) {
    super(props);

    const currentSelection = this.getCurrentSelection(props);

    this.state = {
      networkId: this.props.networkId || '',
      currentSelection,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.currentValueChanged(nextProps)) {
      const currentSelection = this.getCurrentSelection(nextProps);

      this.setState({
        networkId: this.props.networkId || '',
        currentSelection,
      });
    }
  }

  currentValueChanged = (nextProps) => {
    return !isEqual(
      this.props.selectedItems.map((i) => i.id),
      nextProps.selectedItems.map((i) => i.id)
    );
  };

  getCurrentSelection = (props: Properties) => {
    const currentSelection = props.selectedItems
      .map(this.itemToOption)
      .filter((option) => option.value && option.value.trim() !== '');
    if (props.isMulti) {
      return currentSelection;
    } else {
      return currentSelection[0];
    }
  };

  itemToOption = (item: Item = null): Option => {
    if (item) {
      const option: Option = {
        value: item.id,
        label: item.name,
      };

      if (this.props.includeImage) {
        option.image = item.image;
      }

      return option;
    }
  };

  handleChange = (currentSelection): void => {
    this.setState({ currentSelection });

    if (this.props.isMulti) {
      this.props.onChange(currentSelection.map((option) => option.value));
    } else {
      if (currentSelection) {
        this.props.onChange(currentSelection.value);
      } else {
        this.props.onChange(null);
      }
    }
  };

  loadOptions = async (input: string) => {
    if (!input) return [];

    const items = await this.props.search(input, this.state.networkId);

    return items.map(this.itemToOption);
  };

  customOption = (props): JSX.Element => {
    return (
      <components.Option {...props}>
        <CustomOptionComponent {...props}>{props.children}</CustomOptionComponent>
      </components.Option>
    );
  };

  get closeOnSelect() {
    return !this.props.isMulti;
  }

  render() {
    return (
      <AsyncSelect
        isClearable
        name={this.props.name}
        classNamePrefix='chat-select'
        autoFocus={this.props.autoFocus}
        isMulti={this.props.isMulti}
        closeMenuOnSelect={this.closeOnSelect}
        className={classNames('autocomplete', this.props.className)}
        value={this.state.currentSelection}
        placeholder={this.props.placeholder}
        noOptionsMessage={() => this.props.noResultsText}
        loadOptions={this.loadOptions}
        onChange={this.handleChange}
        components={{ Option: this.customOption }}
      />
    );
  }
}
