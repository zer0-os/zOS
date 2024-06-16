import { shallow } from 'enzyme';

import { WalletListItem, Properties } from '.';
import { bem } from '../../lib/bem';

const c = bem('.wallet-list-item');

describe(WalletListItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      wallet: [] as any,
      tag: '',

      ...props,
    };

    return shallow(<WalletListItem {...allProps} />);
  };

  it('renders the wallet item', function () {
    const wrapper = subject({ wallet: { publicAddress: '0xA100C16E67884Da7d515211Bb065592079bEcde6' } as any });

    expect(wrapper.find(c('wallet'))).toHaveText('0xA100...cde6');
  });

  it('renders a tag if provided', function () {
    const wrapper = subject({ tag: 'default' });

    expect(wrapper.find(c('tag')).text()).toEqual('default');
  });

  it('does NOT render tag if NOT provided', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(c('tag'));
  });
});
