import React from 'react';

import { shallow } from 'enzyme';

import { LinkPreview, Properties } from './';
import { LinkPreviewType } from '../../lib/link-preview';

describe('link-preview', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      type: LinkPreviewType.Link,
      url: '',
      title: '',
      description: '',
      width: 100,
      thumbnail: { url: 'thing' } as any,
      ...props,
    };

    return shallow(<LinkPreview {...allProps} />);
  };

  it('it adds provided className', function () {
    const wrapper = subject({ className: 'tacos', title: 'what' });

    expect(wrapper.hasClass('tacos')).toBeTrue();
  });

  it('it renders the title', function () {
    const title = 'This is the best preview';

    const wrapper = subject({ authorName: 'carl', title });

    expect(wrapper.find('.link-preview__title').text().trim()).toEqual(title);
  });

  it('it renders the author name for twitter preview', function () {
    const authorName = 'bob cats';

    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Twitter',
      authorName,
    });

    expect(wrapper.find('.link-preview__title').text().trim()).toEqual(authorName);
  });

  it('it adds author handle to title for twitter preview', function () {
    const authorName = 'bob cats';

    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Twitter',
      authorName,
      authorUrl: 'http://twitter.com/BobCats',
    });

    expect(wrapper.find('.link-preview__author-handle').text().trim()).toEqual('@BobCats');
  });

  it('it renders thumbnail if provided', function () {
    const url = 'http://example.com/thumbnail.jpg';

    const wrapper = subject({
      thumbnail: {
        url,
        width: 100,
        height: 300,
      },
    });

    expect(wrapper.find('.link-preview__banner-image').prop('source')).toEqual(url);
  });
});
