import { shallow } from 'enzyme';

import { pressButton } from '../../../test/utils';
import { RecoveredBackup, Properties } from '.';

describe(RecoveredBackup, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onClose: () => null,
      ...props,
    };

    return shallow(<RecoveredBackup {...allProps} />);
  };

  it('publishes onClose event', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    pressButton(wrapper, 'Dismiss');

    expect(onClose).toHaveBeenCalledOnce();
  });
});
