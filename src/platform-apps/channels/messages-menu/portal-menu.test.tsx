import React from 'react';
import { shallow } from 'enzyme';
import PortalMenu from './portal-menu';

jest.mock('react-dom', () => ({
  createPortal: (node, _portalLocation) => {
    return node;
  },
}));

describe('Portal menu', () => {
  const subject = (props: any = {}, boundingRectangle = { x: 100, y: 250 }) => {
    const allProps = {
      className: '',
      isOpen: false,
      onClose: undefined,
      ...props,
    };

    const wrapper = shallow(<PortalMenu {...allProps} />);
    (wrapper.childAt(0).getElement() as any).ref({
      getBoundingClientRect: () => boundingRectangle,
    });
    wrapper.update();
    return wrapper;
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'portal-menu' });

    wrapper.setProps({ isOpen: true });

    expect(wrapper.find('.portal-menu').exists()).toBe(true);
  });

  it('positions popup', () => {
    const wrapper = subject({ className: 'portal-menu' }, { x: 50, y: 99 });

    wrapper.setProps({ isOpen: true });

    expect(wrapper.find('.portal-menu').prop('style')).toEqual({ top: 99, left: 50 });
  });

  it('should call onClose when exit portal', () => {
    const onClose = jest.fn();
    const wrapper = subject({ className: 'portal-menu', onClose });
    wrapper.setProps({ isOpen: true });

    wrapper.find('.portal-menu').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });
});
