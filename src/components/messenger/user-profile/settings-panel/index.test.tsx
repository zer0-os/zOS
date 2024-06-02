import { shallow } from 'enzyme';

import { SettingsPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';
import { MainBackground } from '../../../../store/background';
import { SelectInput } from '@zero-tech/zui/components';

describe(SettingsPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      selectedMainBackground: MainBackground.StaticGreenParticles,

      onBack: () => {},
      onSetMainBackground: () => {},

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
});

export function selectInputItem(wrapper, selector, itemId: string) {
  const selectInput = wrapper.find(selector);
  const item = selectInput.prop('items').find((item) => item.id === itemId);
  item.onSelect();
}
