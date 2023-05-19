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
      isFullScreen: false,
      withTitleBar: false,
      fetchRewards: () => null,
      onClose: () => null,
      openRewardsFAQModal: () => null,
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
        ...baseState(),
        rewards: {
          loading: false,
          ...rewardsState,
        },
      } as RootState;
      return Container.mapState(state);
    };

    function baseState() {
      return {
        ...authState(),
        rewards: { loading: false },
        ...layoutState(),
      } as RootState;
    }

    test('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    test('zero', () => {
      const props = subject({ zero: '17' });

      expect(props.zero).toEqual('17');
    });

    test('withTitleBar', async () => {
      let state = Container.mapState({ ...baseState(), ...authState({ isAMemberOfWorlds: false }) } as RootState);
      expect(state.withTitleBar).toEqual(false);

      state = Container.mapState({ ...baseState(), ...authState({ isAMemberOfWorlds: true }) } as RootState);
      expect(state.withTitleBar).toEqual(true);
    });

    test('isFullScreen', async () => {
      let state = Container.mapState({ ...baseState(), ...layoutState({ isMessengerFullScreen: false }) } as RootState);
      expect(state.isFullScreen).toEqual(false);

      state = Container.mapState({ ...baseState(), ...layoutState({ isMessengerFullScreen: true }) } as RootState);
      expect(state.isFullScreen).toEqual(true);
    });
  });
});

function authState(user = {}) {
  return {
    authentication: {
      user: {
        data: {
          id: 'user-id',
          isAMemberOfWorlds: false,
          ...user,
        },
      },
    },
  };
}

function layoutState(layout = {}) {
  return {
    layout: {
      value: {
        ...layout,
      },
    },
  };
}
