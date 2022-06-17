import React from 'react';
import { shallow } from 'enzyme';
import { ZnsLink } from '@zer0-os/zos-component-library';

import { Container } from '.';

describe('Logo', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      config: { defaultZnsRoute: '' },
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'logo' });

    expect(wrapper.find(ZnsLink).children().first().hasClass('logo')).toBe(true);
  });

  it('should take back to page root', () => {
    const wrapper = subject({ config: { defaultZnsRoute: 'wilder' } });

    expect(wrapper.find(ZnsLink).prop('route')).toEqual('wilder');
  });
});
