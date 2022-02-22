import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { ThemeEngine as ThemeEngineComponent, ViewModes } from '@zer0-os/zos-theme-engine';

export interface Properties {
  viewMode: ViewModes;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { theme: { value: { viewMode } } } = state;

    return {
      viewMode,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  get isDarkMode() {
    return this.props.viewMode === ViewModes.Dark;
  }

  render() {
    return <ThemeEngineComponent viewMode={this.props.viewMode} />;
  }
}

export const ThemeEngine = connectContainer<{}>(Container);
