import classNames from 'classnames';
import * as debouncePromise from 'es6-promise-debounce';
import React from 'react';

import { newIndexForKey } from '../../lib/keyboard-search';

import './styles.scss';

const NEW_ITEM_ID = 'autocompleteNewItem';

export let config = { debounceRate: 250 };

export interface AutocompleteItem {
  id: string;
  value: string;
  summary?: string;
  imageUrl?: string;
  searchTerm?: string; // Internal use
  route: string;
}

export interface Properties {
  ignoreCase?: boolean;
  value: string;
  placeholder?: string;
  readonly?: boolean;
  className?: string;
  itemContainerClassName?: string;
  findMatches: (term: string) => Promise<AutocompleteItem[]>;
  onSelect: (item: AutocompleteItem) => void;
  createItem?: (term: string) => Promise<AutocompleteItem>;
  autoFocus?: boolean;
  clearOnSelection?: boolean;
}

interface State {
  value: string;
  currentSelection: string;
  currentFocusIndex: number;
  matches: AutocompleteItem[];
  staticOptions: AutocompleteItem[];
  searchComplete: boolean;
  inProgress: boolean;
}

export class AutocompleteDropdown extends React.Component<Properties, State> {
  performSearch;
  private _isMounted: boolean = false;
  private anchorElement: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value || '',
      currentSelection: this.props.value || '',
      matches: [],
      staticOptions: [],
      searchComplete: false,
      inProgress: false,
      currentFocusIndex: 0,
    };

    this.performSearch = debouncePromise(this._performSearch, config.debounceRate);
  }

  _performSearch = async searchTerm => {
    return this.props.findMatches(searchTerm);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps: Properties) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value || '' });
    }
  }

  getMatcher = (testValue: string) => {
    if (this.props.ignoreCase) {
      return (item: AutocompleteItem) => item.value.toLowerCase() === testValue.toLowerCase();
    }

    return (item: AutocompleteItem) => item.value === testValue;
  }

  onChange = async event => {
    console.log('onChange');
    const searchTerm = event.target.value;
    this.setState({ value: searchTerm });

    if (searchTerm.trim() === '') {
      this.close();
      return;
    }

    this.setState({
      searchComplete: false,
      inProgress: true,
    });

    const matches = await this.performSearch(searchTerm);
console.log('matches', matches);
    const newItemName = searchTerm.trim();
    const staticOptions = [];
    if (this.props.createItem && newItemName !== '') {
      const matcher = this.getMatcher(newItemName);
      const searchMatchFound = matches.filter(matcher).length > 0;
      if (!searchMatchFound) {
        staticOptions.push({ id: NEW_ITEM_ID, value: `Create '${newItemName}'`, searchTerm: newItemName });
      }
    }

    this.setState({
      matches,
      staticOptions,
      searchComplete: true,
      inProgress: false,
      currentFocusIndex: 0,
    });
  }

  onSelect = async item => {
    if (item.id === NEW_ITEM_ID) {
      item = await this.props.createItem(item.searchTerm);
    }
    // Some components may have already un-mounted this component after `createItem`
    // has completed (see src/componens/add-person-modal/index.tsx).
    // React will yell if you attempt to set state on an unmounted component, so
    // we need to track this state here.
    //
    // If the companont has aready been unmounted, then we can assume that everything
    // has been "closed". The state will be reset when it's re-constructed.
    if (this._isMounted) {
      let newValue;
      if (this.props.clearOnSelection) {
        newValue = '';
      } else {
        newValue = item.value || '';
      }

      this.setState({
        value: newValue,
        currentSelection: item.value,
        searchComplete: false,
        inProgress: false,
      });

      this.props.onSelect(item);
      this.close();
    }
  }

  close() {
    if (this._isMounted) {
      this.setState({
        matches: [],
        staticOptions: [],
        searchComplete: false,
        inProgress: false,
        currentFocusIndex: 0,
      });
    }
  }

  abortChange = () => {
    this.setState({
      value: this.state.currentSelection,
      searchComplete: false,
      inProgress: false,
    });
    this.close();
  }

  setAnchorElements = (ref: HTMLElement) => {
    this.anchorElement = ref;
  }

  onKeyDown = (e) => {
    const allOptions = [...this.state.matches, ...this.state.staticOptions];

    if (!allOptions.length || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter')) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (e.key === 'Enter') {
      this.onSelect(allOptions[this.state.currentFocusIndex]);
      return;
    }

    const currentFocusIndex = newIndexForKey(e.key, this.state.currentFocusIndex, allOptions);

    this.setState({
      currentFocusIndex,
    });
  }

  findClosestScrollableParent() {
    if (!this.anchorElement) {
      return null;
    }

    let closestScrollableParent = this.anchorElement;
    while (closestScrollableParent !== document.body) {
      if (this.elementHasYScroll(closestScrollableParent)) {
        break;
      }
      closestScrollableParent = closestScrollableParent.parentElement;
    }

    if (closestScrollableParent === document.body) {
      closestScrollableParent = this.anchorElement;
    }

    return closestScrollableParent;
  }

  closeOnParentScroll() {
    const closestScrollableParent = this.findClosestScrollableParent();

    if (!closestScrollableParent) {
      return;
    }

    closestScrollableParent.onscroll = () => {
      this.close();
      closestScrollableParent.onscroll = null;
    };
  }

  anchorRectangle() {
    if (this.anchorElement) {
      return this.anchorElement.getBoundingClientRect();
    }

    return { top: 0, height: 0, left: 0, width: 0 };
  }

  render() {
    let dropdown;
    if (this.state.searchComplete || this.state.inProgress) {
      const allOptions = [...this.state.matches, ...this.state.staticOptions];
      const focusedItem = allOptions[this.state.currentFocusIndex] || {};

      let staticOptions;
      if (this.state.searchComplete && this.state.staticOptions.length) {
        staticOptions = this.staticOptions(this.state.staticOptions, focusedItem);
      }

      this.closeOnParentScroll();

      const rect = this.anchorRectangle();
      const position = {
        top: rect.top + rect.height,
        left: rect.left,
        width: rect.width,
      } as React.CSSProperties;

      let results;
      if (!this.state.inProgress) {
        results = (
          <>
            {this.state.searchComplete && this.results(this.state.matches, focusedItem)}
            {staticOptions}
          </>
        );
      }

      dropdown = (
        <div
          className={classNames('autocomplete-dropdown__item-container', this.props.itemContainerClassName, this.props.className)}
          style={position}
        >
          <div className='autocomplete-dropdown__results'>
            <div className='autocomplete-dropdown__items' >

            { this.state.inProgress &&
              <div className='autocomplete-dropdown-item autocomplete-dropdown__no-results'>Searching...</div>
            }
            {results}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={classNames('autocomplete-dropdown', this.props.className)} ref={this.setAnchorElements}>
        <input
          className='autocomplete-dropdown__input'
          value={this.state.value}
          placeholder={this.props.placeholder}
          readOnly={this.props.readonly}
          onChange={this.onChange}
          onBlur={this.abortChange}
          autoFocus={this.props.autoFocus || false}
          onKeyDown={this.onKeyDown}
        />
        {dropdown}
      </div>
    );
  }

  results(items, focusedItem) {
    let content;
    if (!items.length) {
      content = (
        <div className='autocomplete-dropdown-item autocomplete-dropdown__no-results'>No results found</div>
      );
    } else {
      content = items.map(item => (
        <Result isFocused={item.id === focusedItem.id} item={item} onSelect={this.onSelect} key={item.id} />
      ));
    }

    return content;
  }

  staticOptions(items, focusedItem) {
    return (
      <div className='autocomplete-dropdown__static-options'>
        <hr />
        <div className='autocomplete-dropdown__items' >
          {items.map(item => (
            <Result isFocused={item.id === focusedItem.id} item={item} onSelect={this.onSelect} key={item.id} />
          ))}
        </div>
      </div>
    );
  }

  private elementHasYScroll(closestScrollParent: HTMLElement) {
    return closestScrollParent.scrollHeight > closestScrollParent.clientHeight;
  }
}

class Result extends React.Component<{ item: AutocompleteItem, isFocused: boolean, onSelect(AutocompleteItem) }, undefined> {
  onSelect = event => {
    // Prevent further events from happening, such as: onBlur of the input
    event.stopPropagation();
    event.preventDefault();
    this.props.onSelect(this.props.item);
  }

  render() {
    const { item: { value, summary, route } } = this.props;
    return (
      <div className={classNames('autocomplete-dropdown-item', { 'is-focused': this.props.isFocused })} onMouseDown={this.onSelect}>
        <div className='autocomplete-dropdown-item__text' title={summary}>
          <span className='autocomplete-dropdown-item__value'>{value}</span>&nbsp;
          <span className='autocomplete-dropdown-item__route'>{route}</span>
        </div>
      </div>
    );
  }
}
