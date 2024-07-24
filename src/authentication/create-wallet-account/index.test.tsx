import { shallow } from 'enzyme';

import { CreateWalletAccount, Properties } from '.';

describe('CreateWalletAccount', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isConnecting: false,
      error: '',
      onSelect: () => null,
      isWalletConnected: false,
      ...props,
    };

    return shallow(<CreateWalletAccount {...allProps} />);
  };

  it('renders the rainbowkit connect button', function () {
    const wrapper = subject({});

    expect(wrapper).toHaveElement('RainbowKitConnectButton');
  });

  it('shows an error', function () {
    const wrapper = subject({ error: 'something went wrong' });
    expect(wrapper).toHaveElement('Alert');

    wrapper.setProps({ error: '' });
    expect(wrapper).not.toHaveElement('Alert');
  });

  it('does not show error while connecting', function () {
    const wrapper = subject({ isConnecting: true, error: 'something went wrong' });

    expect(wrapper).not.toHaveElement('Alert');
  });
});
