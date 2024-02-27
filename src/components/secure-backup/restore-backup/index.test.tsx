import { shallow } from 'enzyme';

import { RestoreBackup, Properties } from '.';
import { pressButton } from '../../../test/utils';

import { Alert, Button, Input } from '@zero-tech/zui/components';

describe('RestoreBackup', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      errorMessage: '',
      onRestore: () => null,
      ...props,
    };

    return shallow(<RestoreBackup {...allProps} />);
  };

  it('publishes onRestore event with recovery key', function () {
    const onRestore = jest.fn();
    const wrapper = subject({ onRestore });

    wrapper.find(Input).simulate('change', 'test-recovery-key');

    pressButton(wrapper, 'Verify');

    expect(onRestore).toHaveBeenCalledWith('test-recovery-key');
  });

  it('renders Alert when errorMessage is provided', function () {
    const wrapper = subject({ errorMessage: 'Invalid recovery key' });

    expect(wrapper).toHaveElement(Alert);
  });

  it('does not render Alert when errorMessage is not provided', function () {
    const wrapper = subject({ errorMessage: '' });

    expect(wrapper).not.toHaveElement(Alert);
  });

  it('disables the button when recovery key is empty', function () {
    const wrapper = subject();

    expect(wrapper.find(Button)).toHaveProp('isDisabled', true);
  });

  it('enables the button when recovery key is entered', function () {
    const wrapper = subject();

    wrapper.find(Input).simulate('change', 'test-recovery-key');

    expect(wrapper.find(Button)).toHaveProp('isDisabled', false);
  });
});
