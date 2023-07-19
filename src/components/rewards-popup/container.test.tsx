import { RootState } from '../../store/reducer';
import { Container } from './container';

jest.mock('react-dom', () => ({
  createPortal: (node, _portalLocation) => {
    return node;
  },
}));

describe('Container', () => {
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
