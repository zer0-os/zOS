import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { ThemeEngine as ThemeEngineComponentDeprecated, ViewModes } from '../../shared-components/theme-engine';
import { ThemeEngine as ThemeEngineComponent } from '@zero-tech/zui/components';
import { Themes } from '@zero-tech/zui/components/ThemeEngine';
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

  isLightModeIsSaved = (keyStorageLightMode: string): string | null => {
    return localStorage.getItem(keyStorageLightMode);
  };

  get isDarkMode() {
    return this.props.viewMode === ViewModes.Dark;
  }

  // Translate to new zUI Theme
  get theme() {
    return this.isDarkMode ? Themes.Dark : Themes.Light;
  }

  render() {
    return (
      <>
        <ThemeEngineComponentDeprecated viewMode={this.props.viewMode} />
        <ThemeEngineComponent theme={this.theme} />
      </>
    );
  }
}

export const ThemeEngine = connectContainer<{}>(Container);
