import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';

import { Container } from '.';
import { ViewModes } from '../../shared-components/theme-engine';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { IconMoon1, IconSun } from '@zero-tech/zui/icons';

describe('ViewModeToggle', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'tacos' });

    expect(wrapper.find('.view-mode-toggle').hasClass('tacos')).toBe(true);
  });

  it('adds class for Dark mode', () => {
    const wrapper = subject({ viewMode: ViewModes.Dark });

    expect(wrapper.find('.view-mode-toggle').hasClass('dark')).toBe(true);
  });

  it('adds class for Light mode', () => {
    const wrapper = subject({ viewMode: ViewModes.Light });

    expect(wrapper.find('.view-mode-toggle').hasClass('light')).toBe(true);
  });

  it('uses moon icon when in Dark mode', () => {
    const wrapper = subject({ viewMode: ViewModes.Dark });

    expect(wrapper.find(IconButton).prop('Icon')).toBe(IconMoon1);
  });

  it('uses sun icon when in Light mode', () => {
    const wrapper = subject({ viewMode: ViewModes.Light });

    expect(wrapper.find(IconButton).prop('Icon')).toBe(IconSun);
  });

  it('sets view mode to Dark onClick when currently Light', () => {
    const setViewMode = jest.fn();
    const wrapper = subject({ viewMode: ViewModes.Light, setViewMode });

    wrapper.find(IconButton).simulate('click');

    expect(setViewMode).toHaveBeenCalledWith(ViewModes.Dark);
  });

  it('sets view mode to Light when currently Dark onClick', () => {
    const setViewMode = jest.fn();
    const wrapper = subject({ viewMode: ViewModes.Dark, setViewMode });

    wrapper.find(IconButton).simulate('click');

    expect(setViewMode).toHaveBeenCalledWith(ViewModes.Light);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) =>
      Container.mapState({
        ...state,
        theme: {
          viewMode: ViewModes.Dark,
          ...(state.theme || {}),
        },
      } as RootState);

    test('viewMode', () => {
      const state = subject({
        theme: { value: { viewMode: ViewModes.Light } },
      });

      expect(state.viewMode).toEqual(ViewModes.Light);
    });
  });
});
