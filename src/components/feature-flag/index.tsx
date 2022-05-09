import React from 'react';
import { FeatureFlags, featureFlags } from '../../lib/feature-flags';

export interface PublicProperties {
  featureFlag: string;

  children?: any;
}

export interface Properties extends PublicProperties {
  featureFlags: FeatureFlags;
}

export const Component = (props: Properties) => {
  if (props.featureFlags[props.featureFlag]) {
    return props.children;
  }

  return null;
}

export const FeatureFlag = inject<PublicProperties>(Component);

export function inject<T>(ChildComponent: any) {
  return class FeatureFlagInjector extends React.Component<T> {
    render() {
      return <ChildComponent {...this.props} featureFlags={featureFlags} />;
    }
  };
}
