import React from 'react';

import { EmailLoginErrors, LoginState } from '../../store/login';
import { RootState } from '../../store/reducer';

import { Container } from './container';
import { RewardsState } from '../../store/rewards';

describe('Container', () => {
  describe('mapState', () => {
    const subject = (rewardsState: Partial<RewardsState> = {}) => {
      const state = {
        rewards: {
          loading: false,
          ...rewardsState,
        },
      } as RootState;
      return Container.mapState(state);
    };

    test('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    test('zero', () => {
      const props = subject({ zero: 17 });

      expect(props.zero).toEqual(17);
    });
  });
});
