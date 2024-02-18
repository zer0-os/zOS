import React from 'react';

import { shallow } from 'enzyme';
import { VerifyIdDialog, Properties } from '.';
import { IconButton } from '@zero-tech/zui/components';

describe(VerifyIdDialog, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onClose: () => {},

      ...props,
    };

    return shallow(<VerifyIdDialog {...allProps} />);
  };

  it('publishes close event when clicking the cross icon button', function () {
    const onClose = jest.fn();

    subject({ onClose }).find(IconButton).simulate('click');

    expect(onClose).toHaveBeenCalled();
  });
});
