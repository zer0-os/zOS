import { Container } from './container';
import { Errors, WalletsState } from '../../../../store/account-management';
import { RootState } from '../../../../store/reducer';

describe('Container', () => {
  describe('mapState', () => {
    const subject = (inputState: Partial<RootState> = {}) => {
      const state = {
        authentication: { user: {} },
        web3: { value: {} },
        accountManagement: { errors: [], isWalletSelectModalOpen: false },
        ...inputState,
      } as RootState;
      return Container.mapState(state);
    };

    describe('errors', () => {
      test('wallets error: unknown error', () => {
        const props = subject({
          accountManagement: { errors: [Errors.UNKNOWN_ERROR] } as WalletsState,
        });

        expect(props.error).toEqual('An unknown error occurred. Please try again');
      });

      test('no error', () => {
        const props = subject({
          accountManagement: { errors: [] } as WalletsState,
        });

        expect(props.error).toEqual('');
      });
    });

    describe('isModalOpen', () => {
      it('is true when wallet select modal is open', () => {
        const props = subject({
          accountManagement: { isWalletSelectModalOpen: true } as WalletsState,
        });

        expect(props.isModalOpen).toEqual(true);
      });
    });
  });
});
