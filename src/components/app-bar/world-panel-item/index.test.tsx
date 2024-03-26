import { shallow } from 'enzyme';

import { WorldPanelItem, Properties } from '.';
import { IconActivityHeart } from '@zero-tech/zui/icons';

describe(WorldPanelItem, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      Icon: null,
      ...props,
    };

    return shallow(<WorldPanelItem {...allProps} />);
  };

  it('renders the icon provided', function () {
    const wrapper = subject({ Icon: IconActivityHeart });

    expect(wrapper).toHaveElement(IconActivityHeart);
  });
});
