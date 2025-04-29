import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store/reducer';

import { ThemeEngine, ViewModes } from '../../shared-components/theme-engine';
import { Container } from '.';

describe('ThemeEngine', () => {
  beforeAll(() => {
    global.localStorage = {
      state: {
        'view-mode': '',
      },
      setItem(key, item) {
        this.state[key] = item;
      },
      getItem(key) {
        return this.state[key];
      },
      removeItem(_) {},
      length: 0,
      clear: () => {},
      key: (_) => '',
    };
  });

  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes viewMode to theme engine', () => {
    const setViewMode = jest.fn();
    const wrapper = subject({ setViewMode, viewMode: ViewModes.Dark });
    console.log(wrapper.debug());

    expect(wrapper.find(ThemeEngine).prop('viewMode')).toBe(ViewModes.Dark);
  });

  it('sets setViewMode on mount even', () => {
    const setViewMode = jest.fn();
    global.localStorage.setItem('viewMode:isLight', 'true');

    subject({
      setViewMode,
    });

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
