import React from 'react';
import { shallow } from 'enzyme';
import { AttachmentPreviewModal } from '.';
import { Modal } from '../modal';
import { IconAlertCircle } from '@zero-tech/zui/icons';

describe(AttachmentPreviewModal, () => {
  const defaultProps = {
    attachment: {
      name: 'test.pdf',
      url: 'http://test.com/test.pdf',
      mimetype: 'application/pdf',
    },
    onClose: jest.fn(),
  };

  const subject = (props = {}) => {
    return shallow(<AttachmentPreviewModal {...defaultProps} {...props} />);
  };

  it('renders iframe for PDF files', () => {
    const wrapper = subject();

    expect(wrapper.find('iframe').exists()).toBe(true);
    expect(wrapper.find('iframe').prop('src')).toBe('http://test.com/test.pdf');
  });

  it('shows alert for non-previewable files', () => {
    const wrapper = subject({
      attachment: {
        ...defaultProps.attachment,
        mimetype: 'application/zip',
      },
    });

    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.find(IconAlertCircle).exists()).toBe(true);
  });

  it('displays correct modal title for previewable files', () => {
    const wrapper = subject();

    expect(wrapper.find(Modal).prop('title')).toBe('File Preview');
  });

  it('displays correct modal title for non-previewable files', () => {
    const wrapper = subject({
      attachment: {
        ...defaultProps.attachment,
        mimetype: 'application/zip',
      },
    });

    expect(wrapper.find(Modal).prop('title')).toBe('Download File');
  });

  it('displays file name', () => {
    const wrapper = subject();

    expect(wrapper.find('.attachment-preview-modal__info p').text()).toBe('test.pdf');
  });

  it('calls onClose when modal is closed', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Modal).prop('onClose')();

    expect(onClose).toHaveBeenCalled();
  });
});
