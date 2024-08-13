import React from 'react';

import { shallow } from 'enzyme';
import { GroupTypeDialog, Properties } from '.';
import { IconButton } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';

describe(GroupTypeDialog, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      ...props,
    };

    return shallow(<GroupTypeDialog {...allProps} />);
  };

  it('publishes close event when clicking the cross icon button', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(IconButton).simulate('click');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes close event when clicking the text button', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Button).simulate('press');

    expect(onClose).toHaveBeenCalled();
  });
});
