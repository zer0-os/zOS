import { shallow } from 'enzyme';

import { SettingsPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';
import { MainBackground } from '../../../../store/background';
import { SelectInput } from '@zero-tech/zui/components';
import { bem } from '../../../../lib/bem';

const c = bem('.settings-panel');

describe(SettingsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isPublicReadReceipts: false,
      selectedMainBackground: MainBackground.StaticGreenParticles,

      onBack: () => {},
      onSetMainBackground: () => {},
      onPrivateReadReceipts: () => {},
      onPublicReadReceipts: () => {},

      ...props,
    };

    return shallow(<SettingsPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });

  it('publishes onSetMainBackground event', () => {
    const onSetMainBackground = jest.fn();
    const wrapper = subject({ onSetMainBackground });

    selectInputItem(wrapper, SelectInput, MainBackground.AnimatedBlackParticles);

    expect(onSetMainBackground).toHaveBeenCalledWith(MainBackground.AnimatedBlackParticles);
    expect(onSetMainBackground).toHaveBeenCalledOnce();
  });

  it('publishes onPrivateReadReceipts event', () => {
    const onPrivateReadReceipts = jest.fn();
    const wrapper = subject({
      isPublicReadReceipts: true,
      onPrivateReadReceipts,
    });

    wrapper.find(c('checkbox')).simulate('change');

    expect(onPrivateReadReceipts).toHaveBeenCalled();
  });

  it('publishes onPublicReadReceipts event', () => {
    const onPublicReadReceipts = jest.fn();
    const wrapper = subject({
      isPublicReadReceipts: false,
      onPublicReadReceipts,
    });

    wrapper.find(c('checkbox')).simulate('change');

    expect(onPublicReadReceipts).toHaveBeenCalled();
  });

  it('renders the check icon when read receipts are public', () => {
    const wrapper = subject({
      isPublicReadReceipts: true,
    });

    expect(wrapper.find(c('checkbox-icon'))).toExist();
  });

  it('does not render the check icon when read receipts are private', () => {
    const wrapper = subject({
      isPublicReadReceipts: false,
    });

    expect(wrapper.find(c('checkbox-icon'))).not.toExist();
  });
});

export function selectInputItem(wrapper, selector, itemId: string) {
  const selectInput = wrapper.find(selector);
  const item = selectInput.prop('items').find((item) => item.id === itemId);
  item.onSelect();
}
