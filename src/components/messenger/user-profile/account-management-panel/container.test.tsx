import { Container } from './container';
import { Errors, AccountManagementState } from '../../../../store/account-management';
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

    it('isAddEmailModalOpen', () => {
      const props = subject({
        accountManagement: { isAddEmailAccountModalOpen: true } as AccountManagementState,
      });

      expect(props.isAddEmailModalOpen).toEqual(true);
    });

    it('successMessage', () => {
      const props = subject({
        accountManagement: { successMessage: 'success' } as AccountManagementState,
      });

      expect(props.successMessage).toEqual('success');
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

    describe('currentUser', () => {
      test('currentUser', () => {
        const props = subject({
          authentication: {
            user: {
              data: {
                id: 'user-id',
                profileSummary: {
                  primaryEmail: 'email@zero.tech',
                  firstName: 'John',
                  lastName: 'Doe',
                  profileImage: 'image',
                },
                wallets: [{ id: 'wallet-id-1', publicAddress: 'address456' }],
              },
            },
          } as any,
        });

        expect(props.currentUser).toEqual({
          userId: 'user-id',
          firstName: 'John',
          lastName: 'Doe',
          profileImage: 'image',
          primaryEmail: 'email@zero.tech',
          wallets: [{ id: 'wallet-id-1', publicAddress: 'address456' }],
        });
      });
    });

    describe('canAddEmail', () => {
      test('can add email', () => {
        const props = subject({
          authentication: {
            user: { data: { profileSummary: { primaryEmail: null } } },
          } as any,
        });

        expect(props.canAddEmail).toEqual(true);
      });

      test('cannot add email', () => {
        const props = subject({
          authentication: {
            user: { data: { profileSummary: { primaryEmail: 'email@zero.tech' } } },
          } as any,
        });

        expect(props.canAddEmail).toEqual(false);
      });
    });
  });
});
