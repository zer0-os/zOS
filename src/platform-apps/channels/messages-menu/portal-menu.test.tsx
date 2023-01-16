import React from 'react';
import { shallow } from 'enzyme';
import PortalMenu from './portal-menu';

describe('Portal menu', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      isOpen: false,
      onClose: undefined,
      ...props,
    };

    return shallow(<PortalMenu {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'portal-menu' });

    expect(wrapper.hasClass('portal-menu')).toBe(true);
  });

  it('should portal menu be active when isOpen true', () => {
    const wrapper = subject({ className: 'portal-menu', isOpen: true });

    expect(wrapper.find('.portal-menu').hasClass('active')).toBe(true);
  });

  it('should call onClose when exit portal', () => {
    const onClose = jest.fn();
    const wrapper = subject({ className: 'portal-menu', isOpen: true, onClose });

    wrapper.find('.portal-menu').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });
});
