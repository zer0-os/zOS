import { shallow } from 'enzyme';

import { Web3Login, Web3LoginProperties } from '.';

describe('Web3Login', () => {
  const subject = (props: Partial<Web3LoginProperties>) => {
    const allProps: Web3LoginProperties = {
      isConnecting: false,
      error: '',
      onSelect: () => null,
      ...props,
    };

    return shallow(<Web3Login {...allProps} />);
  };

  describe('wallet selection', () => {
    it('renders the wallet select', function () {
      const wrapper = subject({});

      expect(wrapper).toHaveElement('WalletSelect');
    });

    it('fires onSelect when wallet is selected', function () {
      const onSelect = jest.fn();
      const wrapper = subject({ onSelect });

      wrapper.find('WalletSelect').simulate('select', 'MetaMask');
      expect(onSelect).toHaveBeenCalledWith('MetaMask');
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

    it('does not show an error when error is empty', function () {
      const wrapper = subject({ error: '' });

      expect(wrapper).not.toHaveElement('Alert');
    });
  });

  describe('when connecting', () => {
    it('shows a loading indicator', function () {
      const wrapper = subject({ isConnecting: true });

      expect(wrapper).toHaveText('Waiting for wallet confirmation');
    });

    it('does not show error', function () {
      const wrapper = subject({ isConnecting: true, error: 'something went wrong' });

      expect(wrapper).not.toHaveElement('Alert');
    });
  });
});
