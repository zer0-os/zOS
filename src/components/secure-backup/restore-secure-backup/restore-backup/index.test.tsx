import { shallow } from 'enzyme';

import { RestoreBackup, Properties } from '.';

import { Alert, PasswordInput } from '@zero-tech/zui/components';

describe('RestoreBackup', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      errorMessage: '',
      restoreProgress: { stage: '', total: 0, successes: 0, failures: 0 },
      onChange: () => null,
      ...props,
    };

    return shallow(<RestoreBackup {...allProps} />);
  };

  it('publishes onChange with the key phrase', function () {
    const onChange = jest.fn();
    const wrapper = subject({ onChange });

    wrapper.find(PasswordInput).simulate('change', 'test-key-phrase');

    expect(onChange).toHaveBeenCalledWith('test-key-phrase');
  });

  it('renders Alert when errorMessage is provided', function () {
    const wrapper = subject({ errorMessage: 'Invalid recovery key' });

    expect(wrapper).toHaveElement(Alert);
  });

  it('does not render Alert when errorMessage is not provided', function () {
    const wrapper = subject({ errorMessage: '' });

    expect(wrapper).not.toHaveElement(Alert);
  });
});
