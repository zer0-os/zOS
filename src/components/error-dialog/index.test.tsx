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

  it('renders a link when linkPath and linkText are provided', function () {
    const wrapper = subject({ linkPath: 'https://example.com', linkText: 'External Link' });

    expect(wrapper.find('a')).toExist();
  });

  it('does not render a link when linkText is not provided', function () {
    const wrapper = subject({ linkPath: 'https://example.com', linkText: '' });

    expect(wrapper.find('a')).not.toExist();
  });

  it('does not render a link when linkPath is not provided', function () {
    const wrapper = subject({ linkPath: '', linkText: 'External Link' });

    expect(wrapper.find('a')).not.toExist();
  });

  it('renders the primary button variant when linkPath is not provided', function () {
    const wrapper = subject({});

    expect(wrapper.find(Button)).toHaveProp('variant', 'primary');
  });

  it('renders the text button variant when linkPath and linkText is provided', function () {
    const wrapper = subject({ linkPath: 'https://example.com', linkText: 'External Link' });

    expect(wrapper.find(Button)).toHaveProp('variant', 'text');
  });
});
