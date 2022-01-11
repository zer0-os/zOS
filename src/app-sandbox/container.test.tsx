import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from './store';
import {AppSandbox} from '.';

describe('AppSandboxContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      route: '',
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes route to sandbox', () => {
    const wrapper = subject({ route: 'tacos.street.pollo' });

    expect(wrapper.find(AppSandbox).prop('znsRoute')).toBe('tacos.street.pollo');
  });

  describe('mapState', () => {
    const subject = (state: RootState) => Container.mapState({
      zns: { value: { route: '' }, ...(state.zns || {}) },
    } as any);

    test('route', () => {
      const route = 'deep.fried.zucchini';

      const state = subject({ zns: { value: { route } } } as RootState);

      expect(state).toMatchObject({ route });
    });
  });
});
