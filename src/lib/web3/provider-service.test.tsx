import React from 'react';
import { shallow } from 'enzyme';

import { service, inject, ProviderService } from './provider-service';

const MockComponent = function(props: { providerService: ProviderService }) {
  const provider: any = props.providerService.get();

  return <div className='chain'>{provider.chainId}</div>;
};

describe('ProviderService', () => {
  const subject = () => service;
  const subjectComponent = () => {
    const Component = inject(MockComponent);

    return shallow(<Component />);
  };

  it('gets registered provider', () => {
    const provider = { networkId: 3 };

    const service = subject();

    service.register(provider);

    expect(service.get()).toBe(provider);
  });

  it('can access provider when injected into a component', () => {
    const provider = { networkId: 3 };

    const component = subjectComponent();
    const service = subject();

    service.register(provider);

    const injectedService = component.find(MockComponent).prop('providerService');

    expect(injectedService.get()).toBe(provider);
  });
});
