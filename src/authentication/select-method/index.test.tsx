import { shallow } from 'enzyme';

import { SelectMethod, Properties } from '.';

describe('SelectMethod', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onEmailSelected: () => null,
      onWalletSelected: () => null,
      ...props,
    };

    return shallow(<SelectMethod {...allProps} />);
  };

  it('fires email selected', function () {
    const onEmailSelected = jest.fn();
    const wrapper = subject({ onEmailSelected });

    wrapper.find({ children: 'Create account with email' }).simulate('press');

    expect(onEmailSelected).toHaveBeenCalledOnce();
  });

  it('fires wallet selected', function () {
    const onWalletSelected = jest.fn();
    const wrapper = subject({ onWalletSelected });

    wrapper.find({ children: 'Create account with wallet' }).simulate('press');

    expect(onWalletSelected).toHaveBeenCalledOnce();
  });
});
