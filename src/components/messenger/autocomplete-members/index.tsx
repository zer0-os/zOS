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
  currentSelection: Option[];
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

    return currentSelection;
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
    this.props.onChange(currentSelection.map((option) => option.value));
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

  handleRemoveMember = (event) => {
    if (!this.props.onChange) return;

    const { currentSelection } = this.state;
    const valueMember = event.target.getAttribute('data-value');
    const removedValue = currentSelection.find((val) => val.value === valueMember);
    if (!removedValue) return;
    this.handleChange(currentSelection.filter((val) => val.value !== valueMember));
  };

  renderSelections = (): JSX.Element => {
    return (
      <div className='current__selections'>
        {this.state.currentSelection.length > 0 && (
          <div className='current__selections-members'>
            <span className='current__selections-count'>
              {this.state.currentSelection.length} member{this.state.currentSelection.length > 1 ? 's' : ''} selected
            </span>
            <div className='current__selections-list'>
              {this.state.currentSelection.map((val) => (
                <div
                  key={val.value}
                  className='current__selections-list__member'
                >
                  {val.image && (
                    <img
                      className='current__selections-list__image'
                      src={val.image}
                      alt='member'
                    />
                  )}
                  {val.label}
                  <span
                    className='current__selections-list__delete'
                    data-value={val.value}
                    onClick={this.handleRemoveMember}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  get closeOnSelect() {
    return !this.props.isMulti;
  }

  render() {
    return (
      <>
        <AsyncSelect
          isClearable={false}
          name={this.props.name}
          classNamePrefix='chat-select'
          autoFocus={this.props.autoFocus}
          isMulti={this.props.isMulti}
          closeMenuOnSelect={this.closeOnSelect}
          className={classNames('autocomplete', this.props.className)}
          value={this.state.currentSelection}
          placeholder={this.props.placeholder}
          noOptionsMessage={() => null}
          loadOptions={this.loadOptions}
          onChange={this.handleChange}
          controlShouldRenderValue={false}
          components={{ Option: this.customOption, DropdownIndicator: () => null, IndicatorSeparator: () => null }}
        />
        {this.renderSelections()}
      </>
    );
  }
}
