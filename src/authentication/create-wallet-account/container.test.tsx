import { Container } from './container';
import { AccountCreationErrors, RegistrationState } from '../../store/registration';
import { RootState } from '../../store/reducer';

describe('Container', () => {
  describe('mapState', () => {
    const subject = (inputState: Partial<RootState> = {}) => {
      const state = {
        authentication: { user: {} },
        web3: { value: {} },
        registration: {},
        ...inputState,
      } as RootState;
      return Container.mapState(state);
    };

    describe('errors', () => {
      test('registration error: address already exists', () => {
        const props = subject({
          registration: { errors: [AccountCreationErrors.PUBLIC_ADDRESS_ALREADY_EXISTS] } as RegistrationState,
        });

        expect(props.error).toEqual('This address has already been registered');
      });
    });

    describe('isConnecting', () => {
      it('is true when registration is pending', () => {
        const props = subject({
          registration: { loading: true } as RegistrationState,
        });

        expect(props.isConnecting).toEqual(true);
      });
    });
  });
});
