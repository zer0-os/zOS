import React from 'react';
import classNames from 'classnames';

import { RootState } from '../../store/reducer';
import { setViewMode } from '../../store/theme';
import { connectContainer } from '../../store/redux-container';

import { ViewModes } from '../../shared-components/theme-engine';

import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconMoon1, IconSun } from '@zero-tech/zui/icons';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
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

  get isDarkMode() {
    return this.props.viewMode === ViewModes.Dark;
  }

  get icon() {
    return this.isDarkMode ? IconMoon1 : IconSun;
  }

  get className() {
    return classNames('view-mode-toggle', this.props.className, {
      dark: this.isDarkMode,
      light: !this.isDarkMode,
    });
  }

  handleClick = () => {
    this.props.setViewMode(this.isDarkMode ? ViewModes.Light : ViewModes.Dark);
  };

  render() {
    return <IconButton className={this.className} Icon={this.icon} onClick={this.handleClick} />;
  }
}

export const ViewModeToggle = connectContainer<PublicProperties>(Container);
