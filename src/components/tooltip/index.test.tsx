import React from 'react';
import { shallow } from 'enzyme';
import Tooltip, { Properties } from './';
import { default as ReactTooltip } from 'rc-tooltip';

const OVERLAY_TEST = 'overlay-test';
const CHILDREN_TEST = 'children';

describe('Tooltip', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      overlay: OVERLAY_TEST,
      ...props,
    };

    return shallow(
      <Tooltip {...allProps}>
        <>{CHILDREN_TEST}</>
      </Tooltip>
    );
  };

  it('render', function () {
    const wrapper = subject({});

    expect(wrapper.find(ReactTooltip).exists()).toBe(true);
  });

  it('renders all props', function () {
    const wrapper = subject({});

    expect(wrapper.find(ReactTooltip).props()).toEqual({
      children: <React.Fragment>children</React.Fragment>,
      destroyTooltipOnHide: true,
      mouseEnterDelay: 0.1,
      mouseLeaveDelay: 0.2,
      overlay: 'overlay-test',
      overlayClassName: 'tooltip',
      showArrow: false,
    });
  });
});
