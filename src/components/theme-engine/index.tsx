import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { ThemeEngine as ThemeEngineComponent, ViewModes } from '../../shared-components/theme-engine';
import { setViewMode } from '../../store/theme';
import { keyStorageLightMode } from '../../store/theme/saga';

export interface Properties {
  viewMode: ViewModes;
  setViewMode: (viewMode: ViewModes) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      theme: {
        value: { viewMode },
      },
    } = state;

    return {
      viewMode,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { setViewMode };
  }

  componentDidMount() {
    const viewMode = this.isLightModeIsSaved(keyStorageLightMode) === 'true' ? ViewModes.Light : ViewModes.Dark;
    this.props.setViewMode(viewMode);
  }

  isLightModeIsSaved = (keyStorageLightMode: string): string => {
    return localStorage.getItem(keyStorageLightMode);
  };

  get isDarkMode() {
    return this.props.viewMode === ViewModes.Dark;
  }

  render() {
    return <ThemeEngineComponent viewMode={this.props.viewMode} />;
  }
}

export const ThemeEngine = connectContainer<{}>(Container);
