import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { ThemeEngine, ViewModes } from '@zer0-os/zos-theme-engine';
import { Container } from '.';

describe('ThemeEngine', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes viewMode to theme engine', () => {
    const wrapper = subject({ viewMode: ViewModes.Dark });

    expect(wrapper.find(ThemeEngine).prop('viewMode')).toBe(ViewModes.Dark);
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
