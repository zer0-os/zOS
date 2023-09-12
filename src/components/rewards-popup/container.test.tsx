import { shallow } from 'enzyme';
import { Properties } from './container';
import { RootState } from '../../store/reducer';
import { Container } from './container';
import { RewardsPopup } from '.';

jest.mock('react-dom', () => ({
  createPortal: (node, _portalLocation) => {
    return node;
  },
}));

describe('Container', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isLoading: false,
      isFullScreen: false,
      withTitleBar: true,
      zero: '',
      zeroInUSD: 0,
      fetchRewards: () => {},
      onClose: () => {},
      openRewardsFAQModal: () => {},
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('parses token number to renderable string', function () {
    const wrapper = subject({ zero: '9123456789111315168' });
    expect(wrapper.find(RewardsPopup).prop('zero')).toEqual('9.12');

    wrapper.setProps({ zero: '9123000000000000000' });
    expect(wrapper.find(RewardsPopup).prop('zero')).toEqual('9.12');

    wrapper.setProps({ zero: '23456789111315168' });
    expect(wrapper.find(RewardsPopup).prop('zero')).toEqual('0.02');

    wrapper.setProps({ zero: '0' });
    expect(wrapper.find(RewardsPopup).prop('zero')).toEqual('0');
  });

  describe('mapState', () => {
    function baseState() {
      return {
        ...authState(),
        ...layoutState(),
        ...rewardState(),
      } as RootState;
    }

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

    test('zero', async () => {
      let state = Container.mapState({ ...baseState(), ...rewardState() } as RootState);
      expect(state.zero).toEqual('');

      state = Container.mapState({ ...baseState(), ...rewardState({ zero: '99999999' }) } as RootState);
      expect(state.zero).toEqual('99999999');
    });

    test('zeroInUSD', async () => {
      let state = Container.mapState({ ...baseState(), ...rewardState() } as RootState);
      expect(state.zeroInUSD).toEqual(0);

      state = Container.mapState({ ...baseState(), ...rewardState({ zeroInUSD: 0.0454243368 }) } as RootState);
      expect(state.zeroInUSD).toEqual(0.0454243368);
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

function rewardState(reward = {}) {
  return {
    rewards: {
      zero: '',
      zeroInUSD: 0,
      ...reward,
    },
  };
}
