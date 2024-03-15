import { shallow } from 'enzyme';

import { VerifyKeyPhrase, Properties } from '.';

import { Alert, Input } from '@zero-tech/zui/components';

describe(VerifyKeyPhrase, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      errorMessage: '',
      onChange: () => null,
      ...props,
    };

    return shallow(<VerifyKeyPhrase {...allProps} />);
  };

  it('publishes onChange with the key phrase', function () {
    const onChange = jest.fn();
    const wrapper = subject({ onChange });

    wrapper.find(Input).simulate('change', 'test-key-phrase');

    expect(onChange).toHaveBeenCalledWith('test-key-phrase');
  });

  it('renders Alert when errorMessage is provided', function () {
    const wrapper = subject({ errorMessage: 'Invalid key prhase' });

    expect(wrapper).toHaveElement(Alert);
  });

  it('does not render Alert when errorMessage is not provided', function () {
    const wrapper = subject({ errorMessage: '' });

    expect(wrapper).not.toHaveElement(Alert);
  });
});
