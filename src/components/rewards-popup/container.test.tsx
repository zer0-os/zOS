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
      withTitleBar: true,
      meow: '',
      meowInUSD: 0,
      fetchRewards: () => {},
      onClose: () => {},
      openRewardsFAQModal: () => {},
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('parses token number to renderable string', function () {
    const wrapper = subject({ meow: '9123456789111315168' });
    expect(wrapper.find(RewardsPopup).prop('meow')).toEqual('9.12');

    wrapper.setProps({ meow: '9123000000000000000' });
    expect(wrapper.find(RewardsPopup).prop('meow')).toEqual('9.12');

    wrapper.setProps({ meow: '23456789111315168' });
    expect(wrapper.find(RewardsPopup).prop('meow')).toEqual('0.02');

    wrapper.setProps({ meow: '0' });
    expect(wrapper.find(RewardsPopup).prop('meow')).toEqual('0');
  });

  describe('mapState', () => {
    function baseState() {
      return {
        ...authState(),
        ...rewardState(),
      } as RootState;
    }

    test('withTitleBar', async () => {
      let state = Container.mapState({ ...baseState(), ...authState({ isAMemberOfWorlds: false }) } as RootState);
      expect(state.withTitleBar).toEqual(false);

      state = Container.mapState({ ...baseState(), ...authState({ isAMemberOfWorlds: true }) } as RootState);
      expect(state.withTitleBar).toEqual(true);
    });

    test('meow', async () => {
      let state = Container.mapState({ ...baseState(), ...rewardState() } as RootState);
      expect(state.meow).toEqual('');

      state = Container.mapState({ ...baseState(), ...rewardState({ meow: '99999999' }) } as RootState);
      expect(state.meow).toEqual('99999999');
    });

    test('meowInUSD', async () => {
      let state = Container.mapState({ ...baseState(), ...rewardState() } as RootState);
      expect(state.meowInUSD).toEqual(0);

      state = Container.mapState({ ...baseState(), ...rewardState({ meowInUSD: 0.0454243368 }) } as RootState);
      expect(state.meowInUSD).toEqual(0.0454243368);
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

function rewardState(reward = {}) {
  return {
    rewards: {
      meow: '',
      meowInUSD: 0,
      ...reward,
    },
  };
}
