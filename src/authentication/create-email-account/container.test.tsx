import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      createAccount: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('CreateEmailAccount').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });
});
