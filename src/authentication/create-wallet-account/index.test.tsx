import { shallow } from 'enzyme';

import { CreateWalletAccount, Properties } from '.';

describe('CreateWalletAccount', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isConnecting: false,
      error: '',
      onSelect: () => null,
      ...props,
    };

    return shallow(<CreateWalletAccount {...allProps} />);
  };

  it('renders the wallet select', function () {
    const wrapper = subject({});

    expect(wrapper).toHaveElement('WalletSelect');
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
