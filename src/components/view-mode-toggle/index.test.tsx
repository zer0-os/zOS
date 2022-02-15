import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import DarkModeToggle from 'react-dark-mode-toggle';
import { Container } from '.';
import { ViewModes } from '@zer0-os/zos-theme-engine';

describe('ViewModeToggle', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders dark mode toggle', () => {
    const wrapper = subject();

    expect(wrapper.find(DarkModeToggle).exists()).toBe(true);
  });

  it('passes true for checked when in Dark mode', () => {
    const wrapper = subject({ viewMode: ViewModes.Dark });

    expect(wrapper.find(DarkModeToggle).prop('checked')).toBe(true);
  });

  it('passes false for checked when in Light mode', () => {
    const wrapper = subject({ viewMode: ViewModes.Light });

    expect(wrapper.find(DarkModeToggle).prop('checked')).toBe(false);
  });

  it('sets view mode to Dark onChange of true', () => {
    const setViewMode = jest.fn();
    const wrapper = subject({ setViewMode });

    wrapper.find(DarkModeToggle).simulate('change', true);

    expect(setViewMode).toHaveBeenCalledWith(ViewModes.Dark);
  });

  it('sets view mode to Light onChange of false', () => {
    const setViewMode = jest.fn();
    const wrapper = subject({ setViewMode });

    wrapper.find(DarkModeToggle).simulate('change', false);

    expect(setViewMode).toHaveBeenCalledWith(ViewModes.Light);
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      ...state,
      theme: {
        viewMode: ViewModes.Dark,
        ...(state.theme || {}),
      },
    } as RootState);

    test('viewMode', () => {
      const state = subject({ theme: { value: { viewMode: ViewModes.Light } } });

      expect(state.viewMode).toEqual(ViewModes.Light);
    });
  });
});
