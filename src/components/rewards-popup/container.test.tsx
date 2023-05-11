import React from 'react';

import { shallow } from 'enzyme';

import { RootState } from '../../store/reducer';
import { RewardsState } from '../../store/rewards';

import { Container, Properties } from './container';

jest.mock('react-dom', () => ({
  createPortal: (node, _portalLocation) => {
    return node;
  },
}));

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      zero: '0',
      fetchRewards: () => null,
      onClose: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('parses token number to renderable string', function () {
    const wrapper = subject({ zero: '9123456789111315168' });
    // Note: Temporarily rendering ZERO in the USD field
    expect(wrapper.find('RewardsPopup').prop('usd')).toEqual('9.1234');

    wrapper.setProps({ zero: '9123000000000000000' });
    expect(wrapper.find('RewardsPopup').prop('usd')).toEqual('9.123');

    wrapper.setProps({ zero: '23456789111315168' });
    expect(wrapper.find('RewardsPopup').prop('usd')).toEqual('0.0234');

    wrapper.setProps({ zero: '0' });
    expect(wrapper.find('RewardsPopup').prop('usd')).toEqual('0');
  });

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
      const props = subject({ zero: '17' });

      expect(props.zero).toEqual('17');
    });
  });
});
