/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import { Waypoint } from './index';
import { Waypoint as ReactWaypoint } from 'react-waypoint';

describe('Waypoint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const subject = (props = {}) => {
    const allProps = {
      onEnter: jest.fn(),
      onLeave: jest.fn(),
      ...props,
    };

    return shallow(<Waypoint {...allProps} />);
  };

  it('renders ReactWaypoint with correct props', () => {
    const bottomOffset = '-90%';
    const wrapper = subject({ bottomOffset });

    expect(wrapper.find(ReactWaypoint).exists()).toBe(true);
    expect(wrapper.find(ReactWaypoint).prop('bottomOffset')).toBe(bottomOffset);
  });

  it('calls onEnter when ReactWaypoint onEnter is triggered', () => {
    const onEnter = jest.fn();
    const wrapper = subject({ onEnter });

    const onEnterHandler = wrapper.find(ReactWaypoint).prop('onEnter');
    onEnterHandler({} as any);

    jest.runAllTimers();

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('passes the bottomOffset prop to ReactWaypoint', () => {
    const bottomOffset = '-50%';
    const wrapper = subject({ bottomOffset });

    expect(wrapper.find(ReactWaypoint).prop('bottomOffset')).toBe(bottomOffset);
  });

  it('updates the ReactWaypoint when props change', () => {
    const onEnter = jest.fn();
    const wrapper = subject({ onEnter });

    const newOnEnter = jest.fn();
    wrapper.setProps({ onEnter: newOnEnter });

    const onEnterHandler = wrapper.find(ReactWaypoint).prop('onEnter');
    onEnterHandler({} as any);

    jest.runAllTimers();

    expect(onEnter).not.toHaveBeenCalled();
    expect(newOnEnter).toHaveBeenCalledTimes(1);
  });

  it('calls onLeave when ReactWaypoint onLeave is triggered', () => {
    const onLeave = jest.fn();
    const wrapper = subject({ onLeave });

    const onLeaveHandler = wrapper.find(ReactWaypoint).prop('onLeave');
    onLeaveHandler({} as any);

    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
