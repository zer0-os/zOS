import { shallow } from 'enzyme';

import { Web3Login, Web3LoginProperties } from '.';
import { Web3LoginErrors } from '../../store/login';

describe('Web3Login', () => {
  const subject = (props: Partial<Web3LoginProperties>) => {
    const allProps: Web3LoginProperties = {
      isConnecting: false,
      error: '',
      onSelect: () => null,
      isWalletConnected: false,
      ...props,
    };

    return shallow(<Web3Login {...allProps} />);
  };

  describe('wallet selection', () => {
    it('renders the RainbowKit connect button', function () {
      const wrapper = subject({});

      expect(wrapper).toHaveElement('RainbowKitConnectButton');
    });
  });

  describe('error handling', () => {
    it('shows an error', function () {
      const errorText = 'something went wrong';
      const wrapper = subject({ error: errorText });

      const alert = wrapper.find('Alert');
      expect(wrapper.exists()).toBeTruthy();
      expect(alert.prop('variant')).toEqual('error');
      expect(alert.prop('children')).toEqual(errorText);
    });

    it('shows a specific error when error is PROFILE_NOT_FOUND', function () {
      const errorText = Web3LoginErrors.PROFILE_NOT_FOUND;
      const expectedText = 'The wallet you connected is not associated with a ZERO account';
      const wrapper = subject({ error: errorText });

      const alert = wrapper.find('Alert');
      expect(alert.exists()).toBeTruthy();
      expect(alert.prop('variant')).toEqual('error');
      expect(alert.prop('children')).toEqual(expectedText);
    });

    it('does not show an error when error is empty', function () {
      const wrapper = subject({ error: '' });

      expect(wrapper).not.toHaveElement('Alert');
    });
  });

  describe('when connecting', () => {
    it('passes isDisabled to RainbowKit button', function () {
      const wrapper = subject({ isConnecting: true });

      expect(wrapper.find('RainbowKitConnectButton').prop('isDisabled')).toBeTruthy();
    });
  });
});
