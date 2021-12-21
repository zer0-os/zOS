import React from 'react';
import { shallow } from 'enzyme';

import { Button } from '.';

describe('Button', () => {
  const subject = (props: any = {}, child: any = <div />) => {
    const allProps = {
      ...props,
    };

    return shallow(<Button {...allProps}>{child}</Button>);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'taco-launcher' });

    expect(wrapper.hasClass('taco-launcher')).toBe(true);
  });

  it('renders label text', () => {
    const wrapper = subject({ label: 'click me' });

    const label = wrapper.find('.button__label');

    expect(label.text().trim()).toBe('click me');
  });

  it('does not render children if label provided', () => {
    const wrapper = subject({ label: 'click me' }, <div className='cats' />);

    const child = wrapper.find('.button__label .cats');

    expect(child.exists()).toBe(false);
  });

  it('renders child text', () => {
    const wrapper = subject({}, 'Click me for a surprise!');

    const label = wrapper.find('.button__label');

    expect(label.text().trim()).toBe('Click me for a surprise!');
  });

  it('renders child element', () => {
    const wrapper = subject({}, <div className='what' />);

    const child = wrapper.find('.button__label .what');

    expect(child.exists()).toBe(true);
  });

  it('propagates onClick', () => {
    const onClick = jest.fn();

    const wrapper = subject({ onClick });

    wrapper.simulate('click');

    expect(onClick).toHaveBeenCalled();
  });
});
