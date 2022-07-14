import React from 'react';
import kebabCase from 'lodash.kebabcase';

import theme from './theme.json';

export enum ViewModes {
  Light = 'light',
  Dark = 'dark',
}

export interface Properties {
  viewMode: ViewModes;
  element: HTMLElement;
  theme: { [viewMode: string]: { [styleProp: string]: any } };
}

export class Component extends React.Component<Properties> {
  componentDidMount() {
    this.setVars(this.props.viewMode);
  }

  componentDidUpdate(prevProps: Properties) {
    if (prevProps.viewMode !== this.props.viewMode) {
      this.setVars(this.props.viewMode);
    }
  }

  setVars(viewMode: ViewModes) {
    const modeObject = this.props.theme[viewMode];

    Object.keys(modeObject).forEach((prop) => {
      this.props.element.style.setProperty(`--${kebabCase(prop)}`, modeObject[prop]);
    });
  }

  render() {
    return null;
  }
}

export function ThemeEngine(props: Partial<Properties>) {
  return (
    <Component
      viewMode={props.viewMode}
      theme={theme}
      element={document.documentElement}
    />
  );
}
