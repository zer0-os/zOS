import { shallow } from 'enzyme';
import React from 'react';

import { ScrollbarContainer, Properties } from '.';

describe('ScrollbarContainer', () => {
  const defaultProps: Properties = {
    children: <div>Test Content</div>,
    variant: 'fixed',
  };

  const subject = (props: Partial<Properties> = {}) => {
    const allProps = { ...defaultProps, ...props };
    return shallow(<ScrollbarContainer {...allProps} />);
  };

  it('renders children correctly', () => {
    const wrapper = subject();
    expect(wrapper.find('.scrollbar-container__content').contains(<div>Test Content</div>)).toBe(true);
  });

  it('applies "fixed" variant by default', () => {
    const wrapper = subject();
    expect(wrapper.find('.scrollbar-container__content').prop('data-variant')).toEqual('fixed');
  });

  it('applies "on-hover" variant when specified', () => {
    const wrapper = subject({ variant: 'on-hover' });
    expect(wrapper.find('.scrollbar-container__content').prop('data-variant')).toEqual('on-hover');
  });

  it('displays panel when variant is "on-hover"', () => {
    const wrapper = subject({ variant: 'on-hover' });
    expect(wrapper.find('.scrollbar-container__panel')).toHaveLength(1);
  });

  it('does not display panel when variant is "fixed"', () => {
    const wrapper = subject();
    expect(wrapper.find('.scrollbar-container__panel')).toHaveLength(0);
  });

  it('hides panel when content is at the bottom', () => {
    const wrapper = subject({ variant: 'on-hover' });
    wrapper.setState({ showPanel: false });
    expect(wrapper.find('.scrollbar-container__panel')).toHaveLength(0);
  });
});
