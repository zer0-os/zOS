import { Container } from './container';
import { Errors, AccountManagementState, State } from '../../../../store/account-management';
import { RootState } from '../../../../store/reducer';

jest.mock('../../../../lib/web3/thirdweb/client', () => ({
  getThirdWebClient: jest.fn(),
  getChain: jest.fn(() => ({
    blockExplorers: [{ url: 'https://sepolia.etherscan.io' }],
  })),
}));

describe('Container', () => {
  describe('mapState', () => {
    const subject = (inputState: Partial<RootState> = {}) => {
      const state = {
        authentication: { user: {} },
        web3: { value: {} },
        accountManagement: { errors: [] },
        ...inputState,
      } as RootState;
      return Container.mapState(state);
    };

    it('successMessage', () => {
      const props = subject({
        accountManagement: { successMessage: 'success' } as AccountManagementState,
      });

      expect(props.successMessage).toEqual('success');
    });

    it('connectedWallet', () => {
      const props = subject({
        web3: { value: { address: 'address123' } } as any,
      });

      expect(props.connectedWalletAddr).toEqual('address123');
    });

    it('addWalletState', () => {
      const props = subject({
        accountManagement: { state: State.NONE } as any,
      });

      expect(props.addWalletState).toEqual(State.NONE);
    });

    describe('errors', () => {
      test('wallets error: unknown error', () => {
        const props = subject({
          accountManagement: { errors: [Errors.UNKNOWN_ERROR] } as AccountManagementState,
        });

        expect(props.error).toEqual('An unknown error occurred. Please try again');
      });

      test('no error', () => {
        const props = subject({
          accountManagement: { errors: [] } as AccountManagementState,
        });

        expect(props.error).toEqual('');
      });
    });
  });
});
