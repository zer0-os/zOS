import { shallow } from 'enzyme';

import { CreateWalletAccount, Properties } from '.';

describe('CreateWalletAccount', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<CreateWalletAccount {...allProps} />);
  };

  it('renders the wallet select', function () {
    const wrapper = subject({});

    expect(wrapper).toHaveElement('WalletSelect');
  });
});
