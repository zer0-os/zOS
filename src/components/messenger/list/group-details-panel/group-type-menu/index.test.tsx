import { shallow } from 'enzyme';
import { GroupTypeMenu, Properties } from '.';
import { SelectInput, IconButton } from '@zero-tech/zui/components';
import { GroupType } from '..';

const featureFlags = { enableChannels: true };
jest.mock('../../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(GroupTypeMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onSelect: jest.fn(),
      onOpen: jest.fn(),
      ...props,
    };

    return shallow(<GroupTypeMenu {...allProps} />);
  };

  it('publishes onSelect event when encrypted group is selected', () => {
    const onSelect = jest.fn();
    const wrapper = subject({ onSelect });

    selectInputItem(wrapper, SelectInput, 'encrypted');

    expect(onSelect).toHaveBeenCalledWith(GroupType.ENCRYPTED);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('publishes onSelect event when super group is selected', () => {
    const onSelect = jest.fn();
    const wrapper = subject({ onSelect });

    selectInputItem(wrapper, SelectInput, 'super-group');

    expect(onSelect).toHaveBeenCalledWith(GroupType.SUPER);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('publishes onOpen event when icon button is clicked', () => {
    const onOpen = jest.fn();
    const wrapper = subject({ onOpen });

    wrapper.find(IconButton).simulate('click');

    expect(onOpen).toHaveBeenCalledOnce();
  });
});

export function selectInputItem(wrapper, selector, itemId: string) {
  const selectInput = wrapper.find(selector);
  const item = selectInput.prop('items').find((item) => item.id === itemId);
  item.onSelect();
}
