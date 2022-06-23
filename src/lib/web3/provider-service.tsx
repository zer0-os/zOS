import React from 'react';

export class ProviderService {
  _provider: null;

  register(provider: any) {
    this._provider = provider;
  }

  get() {
    return this._provider;
  }
}

export const service = new ProviderService();
export function inject<T>(ChildComponent: any) {
  return class ProviderServiceInjector extends React.Component<T> {
    render() {
      return (
        <ChildComponent
          {...this.props}
          providerService={service}
        />
      );
    }
  };
}
