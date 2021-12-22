import { shallow } from 'enzyme';

import { Dialog } from '.';

// NOTE -- Enzyme does not currently support context in class components
// due to react's functionality splitting with hooks. 
// https://github.com/enzymejs/enzyme/issues/2189
// https://github.com/enzymejs/enzyme/issues/1553
// https://github.com/enzymejs/react-shallow-renderer/pull/100
// Once we get some time to help that over the line, we should add tests for
// escape manager context.
describe('Dialog', () => {
  const subject = (props: any = {}, child = <div />) => {
    const allProps = {
      ...props,
    };

    return shallow(<Dialog {...allProps}>{child}</Dialog>);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'taco-launcher' });

    expect(wrapper.find('.dialog.taco-launcher').exists()).toBe(true);
  });

  it('renders child', () => {
    const wrapper = subject({}, <div className='the-child' />);

    expect(wrapper.find('.the-child').exists()).toBe(true);
  });

  it('calls onClose when underlay is clicked', () => {
    const onClose = jest.fn();

    const wrapper = subject({ onClose });

    wrapper.find('.dialog__underlay').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });
});
