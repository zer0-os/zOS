import { shallow } from 'enzyme';
import { GroupTypeMenu, Properties } from '.';
import { SelectInput, Alert } from '@zero-tech/zui/components';

const featureFlags = { enableChannels: true };
jest.mock('../../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(GroupTypeMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      onSelect: jest.fn(),
      ...props,
    };

    return shallow(<GroupTypeMenu {...allProps} />);
  };

  it('publishes onSelect event when encrypted group is selected', () => {
    const onSelect = jest.fn();
    const wrapper = subject({ onSelect });

    selectInputItem(wrapper, SelectInput, 'encrypted');

    expect(onSelect).toHaveBeenCalledWith('Encrypted Group');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('publishes onSelect event when super group is selected', () => {
    const onSelect = jest.fn();
    const wrapper = subject({ onSelect });

    selectInputItem(wrapper, SelectInput, 'super-group');

    expect(onSelect).toHaveBeenCalledWith('Super Group');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('publishes onSelect event when social channel is selected', () => {
    const onSelect = jest.fn();
    const wrapper = subject({ onSelect });

    selectInputItem(wrapper, SelectInput, 'social-channel');

    expect(onSelect).toHaveBeenCalledWith('Social Channel');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('renders alerts when a group type is selected', () => {
    const wrapper = subject();

    selectInputItem(wrapper, SelectInput, 'encrypted');
    expect(wrapper.find(Alert)).toExist();

    selectInputItem(wrapper, SelectInput, 'super-group');
    expect(wrapper.find(Alert)).toExist();

    selectInputItem(wrapper, SelectInput, 'social-channel');
    expect(wrapper.find(Alert)).toExist();
  });
});

export function selectInputItem(wrapper, selector, itemId: string) {
  const selectInput = wrapper.find(selector);
  const item = selectInput.prop('items').find((item) => item.id === itemId);
  item.onSelect();
}
