import React from 'react';
import kebabCase from 'lodash.kebabcase';

import themeJson from './theme.json';

export enum ViewModes {
  Light = 'light',
  Dark = 'dark',
}

export interface Properties {
  viewMode: ViewModes;
  element?: HTMLElement;
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
      this.props.element && this.props.element.style.setProperty(`--${kebabCase(prop)}`, modeObject[prop]);
    });
  }

  render() {
    return null;
  }
}

export function ThemeEngine({
  viewMode,
  theme = themeJson,
  element,
}: Omit<Properties, 'theme'> & { theme?: Properties['theme'] }) {
  return <Component viewMode={viewMode} theme={theme} element={element} />;
}
