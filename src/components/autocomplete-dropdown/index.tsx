import classNames from 'classnames';
import debouncePromise from 'es6-promise-debounce';
import React from 'react';

import { newIndexForKey, Key } from '../../lib/keyboard-search';

import './styles.scss';

export let config = { debounceRate: 250 };

export interface AutocompleteItem {
  id: string;
  value: string;
  summary?: string;
  searchTerm?: string; // Internal use
  route: string;
}

export interface Properties {
  value: string;
  placeholder?: string;
  className?: string;
  itemContainerClassName?: string;
  findMatches: (term: string) => Promise<AutocompleteItem[]>;
  onSelect: (item: AutocompleteItem) => void;
  onCancel: () => void;
}

interface State {
  value: string;
  currentSelection: string;
  currentFocusIndex: number;
  matches: AutocompleteItem[];
  searchComplete: boolean;
  inProgress: boolean;
  dropdownHeight?: number;
}

export class AutocompleteDropdown extends React.Component<Properties, State> {
  performSearch;
  itemsElement;
  private _isMounted: boolean = false;
  private anchorElement: HTMLElement;
  private dropdownMinHeight = 35;

  constructor(props) {
    super(props);
    this.itemsElement = React.createRef();

    this.state = {
      value: this.props.value || '',
      currentSelection: this.props.value || '',
      matches: [],
      searchComplete: false,
      inProgress: false,
      currentFocusIndex: 0,
      dropdownHeight: this.dropdownMinHeight,
    };

    this.performSearch = debouncePromise(this._performSearch, config.debounceRate);
  }

  escFunction = (event): void => {
    if (event.key === Key.Escape) {
      this.abortChange();
    }
  };

  _performSearch = async (searchTerm) => {
    return this.props.findMatches(searchTerm);
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.itemsElement.current && prevState.matches?.length !== this.state.matches?.length) {
      requestAnimationFrame(() => {
        if (this._isMounted && this.itemsElement.current) {
          this.setState({
            dropdownHeight: this.itemsElement.current.getBoundingClientRect().height,
          });
        }
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps: Properties) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value || '' });
    }
  }

  onChange = async (event) => {
    const searchTerm = event.target.value;
    this.setState({ value: searchTerm });

    if (searchTerm.trim() === '') {
      this.closeResults();
      return;
    }

    this.setState({
      searchComplete: false,
      inProgress: true,
    });

    const matches = await this.performSearch(searchTerm);

    this.setState({
      matches,
      searchComplete: true,
      inProgress: false,
      currentFocusIndex: 0,
    });
  };

  onSelect = async (item): Promise<void> => {
    // If the component has aready been unmounted, then we can assume that everything
    // has been "closed". The state will be reset when it's re-constructed.
    if (this._isMounted) {
      this.setState({
        value: item.value || '',
        currentSelection: item.value,
        searchComplete: false,
        inProgress: false,
      });

      this.props.onSelect(item);
      this.closeResults();
    }
  };

  closeResults(): void {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      matches: [],
      searchComplete: false,
      inProgress: false,
      currentFocusIndex: 0,
    });
  }

  abortChange = (): void => {
    this.setState({
      value: this.state.currentSelection,
      searchComplete: false,
      inProgress: false,
    });
    this.closeResults();
    this.props.onCancel();
  };

  setAnchorElements = (ref: HTMLElement): void => {
    this.anchorElement = ref;
  };

  onKeyDown = (e): void => {
    const allOptions = [...this.state.matches];

    if (!allOptions.length || (e.key !== Key.ArrowDown && e.key !== Key.ArrowUp && e.key !== Key.Enter)) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    if (e.key === Key.Enter) {
      this.onSelect(allOptions[this.state.currentFocusIndex]);
      return;
    }

    const currentFocusIndex = newIndexForKey(e.key, this.state.currentFocusIndex, allOptions);

    this.setState({
      currentFocusIndex,
    });
  };

  findClosestScrollableParent(): HTMLElement {
    if (!this.anchorElement) {
      return null;
    }

    let closestScrollableParent = this.anchorElement;
    while (closestScrollableParent && closestScrollableParent !== document.body) {
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

  closeOnParentScroll(): HTMLElement {
    const closestScrollableParent = this.findClosestScrollableParent();

    if (!closestScrollableParent) {
      return;
    }

    closestScrollableParent.onscroll = () => {
      this.abortChange();
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
      const allOptions = [...this.state.matches];
      const focusedItem = allOptions[this.state.currentFocusIndex] || {};

      this.closeOnParentScroll();

      const rect = this.anchorRectangle();
      const position = {
        top: rect.top + rect.height,
        left: rect.left,
        width: rect.width,
      } as React.CSSProperties;

      let results;
      if (!this.state.inProgress) {
        results = <>{this.state.searchComplete && this.results(this.state.matches, focusedItem)}</>;
      }

      dropdown = (
        <div
          className={classNames(
            'autocomplete-dropdown__item-container',
            this.props.itemContainerClassName,
            this.props.className
          )}
          style={position}
        >
          <div
            className='autocomplete-dropdown__results'
            style={{
              height: this.state.dropdownHeight,
            }}
          >
            <div className='autocomplete-dropdown__items' ref={this.itemsElement}>
              {this.state.inProgress && (
                <div className='autocomplete-dropdown-item autocomplete-dropdown__no-results'>Searching...</div>
              )}
              {results}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={classNames('autocomplete-dropdown', this.props.className)}
        ref={this.setAnchorElements}
        onKeyDown={this.escFunction}
      >
        <input
          className='autocomplete-dropdown__input'
          value={this.state.value}
          placeholder={this.props.placeholder}
          onChange={this.onChange}
          onBlur={this.abortChange}
          onKeyDown={this.onKeyDown}
          autoFocus
        />
        {dropdown}
      </div>
    );
  }

  results(items: AutocompleteItem[], focusedItem): React.ReactElement {
    let content;
    if (!items?.length) {
      content = <div className='autocomplete-dropdown-item autocomplete-dropdown__no-results'>No results found</div>;
    } else {
      content = items?.map((item) => (
        <Result isFocused={item.id === focusedItem.id} item={item} onSelect={this.onSelect} key={item.id} />
      ));
    }

    return content;
  }

  private elementHasYScroll(closestScrollParent: HTMLElement): boolean {
    return closestScrollParent && closestScrollParent.scrollHeight > closestScrollParent.clientHeight;
  }
}

export interface ResultProperties {
  item: AutocompleteItem;
  isFocused: boolean;
  onSelect(AutocompleteItem);
}
export class Result extends React.Component<ResultProperties, undefined> {
  onSelect = (event): void => {
    // Prevent further events from happening, such as: onBlur of the input
    event.stopPropagation();
    event.preventDefault();
    this.props.onSelect(this.props.item);
  };

  render() {
    const {
      item: { value, summary, route },
    } = this.props;
    return (
      <div
        className={classNames('autocomplete-dropdown-item', {
          'is-focused': this.props.isFocused,
        })}
        onMouseDown={this.onSelect}
      >
        <div className='autocomplete-dropdown-item__text' title={summary}>
          <span className='autocomplete-dropdown-item__value'>{value}</span>
          &nbsp;
          <span className='autocomplete-dropdown-item__route'>{route}</span>
        </div>
      </div>
    );
  }
}
