import React from 'react';
import { shallow } from 'enzyme';
import { ReportUserModal, Properties } from './index';
import { Alert, SelectInput, Input, IconButton } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';

describe('ReportUserModal', () => {
  const mockOnReport = jest.fn();
  const mockOnClose = jest.fn();
  const defaultProps: Properties = {
    reportedUserName: 'testUser',
    loading: false,
    errorMessage: '',
    successMessage: '',
    onReport: mockOnReport,
    onClose: mockOnClose,
  };

  const subject = (props: Partial<Properties> = {}) => {
    const allProps = { ...defaultProps, ...props };
    return shallow(<ReportUserModal {...allProps} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const wrapper = subject();

    expect(wrapper.find('h2').text()).toContain('Report User');
    expect(wrapper.find('.report-user-dialog__text-content').text()).toContain('Are you sure you want to report user');
    expect(wrapper.find('.report-user-dialog__text-content').text()).toContain('testUser');
  });

  it('renders user name in the text content', () => {
    const wrapper = subject({ reportedUserName: 'testUser' });

    expect(wrapper.find('.report-user-dialog__text-content').text()).toContain('testUser');
  });

  it('shows error message when provided', () => {
    const wrapper = subject({ errorMessage: 'Test error message' });

    expect(wrapper.find(Alert).exists()).toBe(true);
    expect(wrapper.find(Alert).childAt(0)).toHaveText('Test error message');
  });

  it('shows success message when provided', () => {
    const wrapper = subject({ successMessage: 'Test success message' });

    expect(wrapper.find(Alert).exists()).toBe(true);
    expect(wrapper.find(Alert).childAt(0)).toHaveText('Test success message');
  });

  it('calls onClose when close button is clicked', () => {
    const wrapper = subject();

    wrapper.find(IconButton).at(0).simulate('click');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables Report User button if no reason is selected', () => {
    const wrapper = subject();

    const reportButton = wrapper.find(Button).at(1);
    expect(reportButton.prop('isDisabled')).toBe(true);
  });

  it('calls onReport with correct payload when form is submitted', () => {
    const wrapper = subject();

    // Simulate selecting a reason
    selectInputItem(wrapper, SelectInput, 'bot');

    // Simulate adding additional comments
    wrapper.find(Input).simulate('change', 'Test comment');

    // Simulate form submission
    wrapper.find(Button).at(1).simulate('press');

    expect(mockOnReport).toHaveBeenCalledWith({
      reason: 'Seems like a bot',
      comment: 'Test comment',
    });
  });

  it('allows empty comment', () => {
    const wrapper = subject();

    selectInputItem(wrapper, SelectInput, 'bot');

    wrapper.find(Button).at(1).simulate('press');

    expect(mockOnReport).toHaveBeenCalledWith({
      reason: 'Seems like a bot',
      comment: '',
    });
  });

  it('shows loading state when loading prop is true', () => {
    const wrapper = subject({ loading: true });

    const reportButton = wrapper.find(Button).at(1);
    expect(reportButton.prop('isLoading')).toBe(true);
  });
});

export function selectInputItem(wrapper, selector, itemId: string) {
  const selectInput = wrapper.find(selector);
  const item = selectInput.prop('items').find((item) => item.id === itemId);
  item.onSelect();
}
