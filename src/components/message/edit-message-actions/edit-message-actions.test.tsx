import React from 'react';

import { shallow } from 'enzyme';
import EditMessageActions, { Properties } from './edit-message-actions';
import { Tooltip } from '@zero-tech/zui/components';

describe('EditMessageActions', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      value: '',
      primaryTooltipText: '',
      secondaryTooltipText: '',
      onEdit: jest.fn(),
      onCancel: jest.fn(),
      scrollContainerRef: React.createRef(),
      ...props,
    };

    return shallow(<EditMessageActions {...allProps} />);
  };

  it('should call onCancel when Discard Changes icon is clicked', () => {
    const onCancel = jest.fn();
    const wrapper = subject({ onCancel });

    wrapper.find('.edit-message-actions__icon').first().simulate('click');

    expect(onCancel).toHaveBeenCalled();
  });

  it('should call onEdit when Save Changes icon is clicked', () => {
    const onEdit = jest.fn();
    const wrapper = subject({ onEdit });

    wrapper.find('.edit-message-actions__icon').at(1).simulate('click');

    expect(onEdit).toHaveBeenCalled();
  });

  it('should disable Save Changes icon when value is empty', () => {
    const wrapper = subject({ value: '' });

    const isDisabled = wrapper.find('.edit-message-actions__icon').at(1).prop('isDisabled');
    expect(isDisabled).toBe(true);
  });

  it('should enable Save Changes icon when value is not empty', () => {
    const wrapper = subject({ value: 'not empty' });

    const isDisabled = wrapper.find('.edit-message-actions__icon').at(1).prop('isDisabled');
    expect(isDisabled).toBe(false);
  });

  it('should render secondaryTooltipText for the first Tooltip', () => {
    const secondaryTooltipText = 'Discard Changes';
    const wrapper = subject({ secondaryTooltipText });

    const tooltipContent = wrapper.find(Tooltip).first().prop('content');

    expect(tooltipContent).toBe(secondaryTooltipText);
  });

  it('should render primaryTooltipText for the second Tooltip', () => {
    const primaryTooltipText = 'Save Changes';
    const wrapper = subject({ primaryTooltipText });

    const tooltipContent = wrapper.find(Tooltip).at(1).prop('content');

    expect(tooltipContent).toBe(primaryTooltipText);
  });
});
