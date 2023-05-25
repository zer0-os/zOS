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
