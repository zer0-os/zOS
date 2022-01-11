import React from 'react';
import { shallow } from 'enzyme';

import { AppSandbox } from '.';

describe('AppSandbox', () => {
  const subject = (props: any) => {
    const allProps = {
      znsRoute: '',
      ...props,
    };

    return shallow(<AppSandbox {...allProps} />);
  };

  it('renders route', () => {
    const wrapper = subject({ znsRoute: 'tacos.street.pollo' });

    expect(wrapper.text().trim()).toBe('tacos.street.pollo');
  });
});
