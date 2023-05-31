import { Container } from './container';
import { AccountCreationErrors, RegistrationState } from '../../store/registration';
import { RootState } from '../../store/reducer';
import { Web3State } from '../../store/web3';
import { ConnectionStatus } from '../../lib/web3';

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
      test('web3 connection error', () => {
        let props = subject({ web3: { value: { error: 'Web3 Error' } } as Web3State });

        expect(props.error).toEqual('Web3 Error');
      });

      test('registration error: address already exists', () => {
        const props = subject({
          registration: { errors: [AccountCreationErrors.PUBLIC_ADDRESS_ALREADY_EXISTS] } as RegistrationState,
        });

        expect(props.error).toEqual('This address has already been registered');
      });
    });

    describe('isConnecting', () => {
      it('is true when web3 is connecting', () => {
        const props = subject({
          web3: { status: ConnectionStatus.Connecting, value: {} } as Web3State,
        });

        expect(props.isConnecting).toEqual(true);
      });

      it('is true when registration is pending', () => {
        const props = subject({
          registration: { loading: true } as RegistrationState,
        });

        expect(props.isConnecting).toEqual(true);
      });
    });
  });
});
