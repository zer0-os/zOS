import React from 'react';
import { config } from '../../config';

// should probably use context for this, but we need
// to update our usage of context to match the current
// api.
export function inject<T>(ChildComponent: any) {
  return class ConfigInjector extends React.Component<T> {
    render() {
      return <ChildComponent {...this.props} config={config} />;
    }
  };
}
