import React from 'react';
import { shallow } from 'enzyme';
import AttachmentCard from './attachment-card';

describe('Attachment Cards', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<AttachmentCard {...allProps} />);
  };

  it('renders attachment Card card', () => {
    const attachment = {
      name: 'Lorem_ipsum.pdf',
      type: 'file',
      url: 'attachments/38d23ead-fceb-4d36-a8c3-0d0aca7f4438/Lorem_ipsum.pdf',
    };
    const wrapper = subject({
      attachment,
      onClick: jest.fn(),
    });

    expect(wrapper.prop('className')).toBe('attachment-card downloadable');
  });
});
