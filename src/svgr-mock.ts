/**
 * We are using SVGR to convert SVG files into React components.
 * Unfortunately this doesn't seem to play nice with Jest, so
 * we need to mock the SVGR output (for now).
 */

import { createElement } from 'react';

export const ReactComponent = (props) => {
  return createElement('svg', {
    'data-testid': 'svg-mock',
    ...props,
  });
};

export default ReactComponent;
