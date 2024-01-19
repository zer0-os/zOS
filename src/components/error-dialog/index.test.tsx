import React from 'react';

import { shallow } from 'enzyme';
import { ErrorDialog, Properties } from '.';
import { Button, IconButton } from '@zero-tech/zui/components';

import { bem } from '../../lib/bem';

const c = bem('.error-dialog');

describe('ErrorDialog', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      header: '',
      body: '',
      ...props,
    };

    return shallow(<ErrorDialog {...allProps} />);
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

  it('displays the provided error header', function () {
    const wrapper = subject({ header: 'Test error header' });

    expect(wrapper.find(c('header'))).toHaveText('Test error header');
  });

  it('displays the provided error body', function () {
    const wrapper = subject({ body: 'Test error message' });

    expect(wrapper.find(c('body'))).toHaveText('Test error message');
  });
});
