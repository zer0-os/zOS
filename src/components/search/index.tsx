import React from 'react';
import { Dropdown } from '../dropdown';

interface Properties {
  api?: any;
  onPersonSelected?: any;
  onCompanySelected?: any;
  onSelect?: any;
}

interface SearchState {
  showSearchDrawer: boolean;
  isClosing: boolean;
  isOpening: boolean;
  drawerStyles: any;
}

export class Search extends React.Component<Properties, SearchState> {
  icon = null;

  constructor(props) {
    super(props);

    this.state = {
      showSearchDrawer: true,
      isClosing: false,
      isOpening: false,
      drawerStyles: {},
    };
  }

  openSearchDrawer = () => {
    this.setDynamicStyles();

    this.setState({
      showSearchDrawer: true,
      isOpening: true,
    });
  }

  closeSearchDrawer = (animate = true) => {
    if (animate) {
      this.setState({ isClosing: true });
    } else {
      this.setState({ showSearchDrawer: false });
    }
  }

  setDynamicStyles = () => {
    const rect = this.icon.getBoundingClientRect();

    this.setState({
      drawerStyles: {
        top: Math.round(rect.top - 100),
        right: 0,
      },
    });
  }

  onSelect = item => {
    this.props.onSelect(item.znsRoute);
    this.closeSearchDrawer(false);
  }

  handleAnimationEnd = () => {
    if (this.state.isClosing) {
      this.setState({
        showSearchDrawer: false,
        isClosing: false,
      });
    }
  }

  iconRef = icon => {
    this.icon = icon;
  }

  searchDrawer() {
    let className = 'global-search-drawer';

    if (this.state.isClosing) {
      className += ' close';
    } else if (this.state.isOpening) {
      className += ' open';
    }

    const closeDrawer = () => this.closeSearchDrawer();

    return (
      <div className={className}>
        <div className='global-search-drawer__underlay' onClick={closeDrawer} />
        <div style={this.state.drawerStyles} tabIndex={1} onAnimationEnd={this.handleAnimationEnd} className='global-search-drawer__drawer'>
          <div className='global-search-drawer__search-box'>
            <Dropdown api={this.props.api} onSelect={this.onSelect} itemContainerClassName='global-search-drawer__search-box-results' />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='global-search' onClick={this.openSearchDrawer}>
        <div ref={this.iconRef} className='global-search__icon'>
          {this.searchDrawer()}
        </div>
      </div>
    );
  }
}
