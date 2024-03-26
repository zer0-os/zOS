import { shallow } from 'enzyme';

import { WorldPanelItem, Properties } from '.';
import { IconActivityHeart, IconCheck } from '@zero-tech/zui/icons';

describe(WorldPanelItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      Icon: IconCheck,
      isActive: false,
      ...props,
    };

    return shallow(<WorldPanelItem {...allProps} />);
  };

  it('renders the icon provided', function () {
    const wrapper = subject({ Icon: IconActivityHeart });

    expect(wrapper).toHaveElement(IconActivityHeart);
  });

  it('styles active state', function () {
    expect(subject({ isActive: false })).not.toHaveClassName('world-panel-item--active');
    expect(subject({ isActive: true })).toHaveClassName('world-panel-item--active');
  });
});
