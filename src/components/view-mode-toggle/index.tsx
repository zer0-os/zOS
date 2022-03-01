import React from 'react';
import { RootState } from '../../store';
import { setViewMode } from '../../store/theme';
import { connectContainer } from '../../store/redux-container';

import { ViewModes } from '../../shared-components/theme-engine';

import DarkModeToggle from 'react-dark-mode-toggle';

import './styles.scss';

export interface Properties {
  viewMode: ViewModes;
  setViewMode: (viewMode: ViewModes) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { theme: { value: { viewMode } } } = state;

    return {
      viewMode,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setViewMode };
  }

  get isDarkMode() {
    return this.props.viewMode === ViewModes.Dark;
  }

  handleChange = (isDarkMode) => {
    this.props.setViewMode(isDarkMode ? ViewModes.Dark : ViewModes.Light);
  }

  render() {
    return (
      <DarkModeToggle
        className='view-mode-toggle'
        checked={this.isDarkMode}
        onChange={this.handleChange}
      />
    );
  }
}

export const ViewModeToggle = connectContainer<{}>(Container);
