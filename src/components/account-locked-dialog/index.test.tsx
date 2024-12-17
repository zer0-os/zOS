import { shallow } from 'enzyme';

import { AccountLockedDialog, Properties } from '.';
import { Modal } from '../modal';

describe(AccountLockedDialog, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onLogout: () => null,
      ...props,
    };

    return shallow(<AccountLockedDialog {...allProps} />);
  };

  it('publishes logout event when primary button is clicked', async () => {
    const onLogout = jest.fn();
    const wrapper = subject({ onLogout });

    wrapper.find(Modal).simulate('primary');

    expect(onLogout).toHaveBeenCalled();
  });

  it('publishes logout event when close button is clicked', async () => {
    const onLogout = jest.fn();
    const wrapper = subject({ onLogout });

    wrapper.find(Modal).simulate('close');

    expect(onLogout).toHaveBeenCalled();
  });
});
