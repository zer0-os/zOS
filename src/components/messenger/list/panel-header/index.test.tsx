import React from 'react';
import { shallow } from 'enzyme';

import { PanelHeader, Properties } from '.';

jest.mock('@zero-tech/zui/icons');

describe('PanelHeader', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      title: 'header',
      onBack: () => {},
      ...props,
    };

    return shallow(<PanelHeader {...allProps} />);
  };

  it('fires onBack when back icon clicked', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find('.messenger-panel__back').simulate('click');

    expect(onBack).toHaveBeenCalledOnce();
  });
});
