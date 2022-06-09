import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Link } from 'react-router-dom';
import { Apps, PlatformApp } from '../../lib/apps';
import { Container } from '.';

describe('Logo', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      calssName: '',
      type: '',
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'logo' });

    expect(wrapper.find(Link).children().first().hasClass('logo')).toBe(true);
  });

});
