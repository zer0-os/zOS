import { shallow } from 'enzyme';

import { buttonLabelled, pressButton } from '../../../test/utils';
import { RecoveredBackup, Properties } from '.';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(RecoveredBackup, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isLegacy: false,
      onClose: () => null,
      onGenerate: () => null,
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

  it('publishes onGenerate event when isLegacy is true', function () {
    const onGenerate = jest.fn();
    const wrapper = subject({ onGenerate, isLegacy: true });

    pressButton(wrapper, 'Generate new backup');

    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it('does not render the on generate secondary button when isLegacy is false', function () {
    const wrapper = subject({ isLegacy: false });

    expect(buttonLabelled(wrapper, 'Generate new backup')).not.toExist();
  });

  it('applies the has-secondary-button class when isLegacy is true', function () {
    const wrapper = subject({ isLegacy: true });

    expect(wrapper.find(c('footer--has-secondary-button'))).toExist();
  });

  it('does not apply the has-secondary-button class when isLegacy is false', function () {
    const wrapper = subject({ isLegacy: false });

    expect(wrapper.find(c('footer--has-secondary-button'))).not.toExist();
  });
});
