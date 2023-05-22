import React from 'react';
import { shallow } from 'enzyme';

import { ErrorNetwork } from '../error-network';

describe('ErrorNetwork', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      supportedNetwork: '',
      ...props,
    };
    return shallow(<ErrorNetwork {...allProps} />);
  };

  it('it displays error network', () => {
    const supportedNetwork = 'Rinkeby';

    const wrapper = subject({ supportedNetwork });

    expect(wrapper.find('.error-network__chainId').text().trim()).toBe(
      'Please switch to supported Network Rinkeby in your wallet before connecting'
    );
  });

  it('it adds supportedChainId as title', () => {
    const supportedNetwork = 'Kovan';

    const wrapper = subject({ supportedNetwork });

    expect(wrapper.find('.error-network__chainId').prop('title')).toBe(supportedNetwork);
  });
});
