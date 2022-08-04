import React from 'react';

import { shallow } from 'enzyme';

import { Embed, Properties } from './embed';
import { LinkPreviewType } from '../../lib/link-preview';
import { ButtonLink } from '@zer0-os/zos-component-library';

describe('embed', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      type: LinkPreviewType.Link,
      url: '',
      title: '',
      description: '',
      width: 100,
      ...props,
    };

    return shallow(<Embed {...allProps} />);
  };

  it('it adds provided className', function () {
    const wrapper = subject({ className: 'tacos', title: 'what' });

    expect(wrapper.hasClass('tacos')).toBeTrue();
  });

  it('it renders the title', function () {
    const title = 'This is the best preview';

    const wrapper = subject({ authorName: 'carl', title });

    expect(wrapper.find('.link-preview__title').dive().text().trim()).toEqual(title);
  });

  it('it renders the author name for twitter preview', function () {
    const authorName = 'bob cats';

    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Twitter',
      authorName,
    });

    expect(wrapper.find('.link-preview__title').dive().text().trim()).toEqual(authorName);
  });

  it('it adds author handle to title for twitter preview', function () {
    const authorName = 'bob cats';

    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Twitter',
      authorName,
      authorUrl: 'http://twitter.com/BobCats',
    });

    const title = wrapper.find('.link-preview__title').dive();

    expect(title.find('.link-preview__author-handle').text().trim()).toEqual('@BobCats');
  });

  it('it renders title as a link to author for twitter preview', function () {
    const authorUrl = 'http://twitter.com/BobCats';
    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Twitter',
      authorName: 'bob cats',
      authorUrl,
    });

    const titleNode = wrapper.find('.link-preview__title');

    expect(titleNode.prop('url')).toEqual(authorUrl);
  });

  it('it renders the description', function () {
    const description = 'This is the best preview';

    const wrapper = subject({ description });

    expect(wrapper.find('.link-preview__description').text().trim()).toEqual(description);
  });

  it('it renders a link to the content', function () {
    const url = 'http://example.com/the-link';

    const wrapper = subject({ url });

    expect(wrapper.find('.link-preview__content-link').prop('url')).toEqual(url);
  });

  it('it renders title as a link to content', function () {
    const url = 'http://example.com/the-link';

    const wrapper = subject({ url });

    const titleNode = wrapper.find('.link-preview__title');

    expect(titleNode.is(ButtonLink)).toBeTruthy();
    expect(titleNode.prop('url')).toEqual(url);
  });

  it('it renders provider name in content link', function () {
    const wrapper = subject({ providerName: 'Vimeo', url: 'http://example.com/the-link' });

    const providerName = wrapper
      .find('.link-preview__content-link')
      .find('.link-preview__content-provider')
      .text()
      .trim();

    expect(providerName).toEqual('Vimeo');
  });

  it('it does not render banner-image if no thumbnail', function () {
    const wrapper = subject({ thumbnail: null });

    expect(wrapper.find('.link-preview__banner').exists()).toBeFalsy();
  });

  it('it passes props width to options', function () {
    const url = 'http://example.com/thumbnail.jpg';

    const wrapper = subject({
      width: 325,
      thumbnail: {
        url,
        width: 100,
        height: 300,
      },
    });

    const imageOptions: any = wrapper.find('.link-preview__banner-image').prop('options');

    expect(imageOptions.width).toEqual(325);
  });

  it('it passes height to BackgroundImage', function () {
    const wrapper = subject({
      width: 200,
      thumbnail: {
        url: 'http://example.com/thumbnail.jpg',
        width: 100,
        height: 150,
      },
    });

    const { height }: any = wrapper.find('.link-preview__banner-image').prop('style');

    expect(height).toEqual('300px');
  });

  it('it caps height when ratio is more than 2', function () {
    const wrapper = subject({
      width: 200,
      thumbnail: {
        url: 'http://example.com/thumbnail.jpg',
        width: 100,
        height: 300,
      },
    });

    const { height }: any = wrapper.find('.link-preview__banner-image').prop('style');

    expect(height).toEqual('400px');
  });

  it('it passes autoHeight instead of height to BackgroundImage if thumbnail has no dimensions', function () {
    const wrapper = subject({
      width: 200,
      thumbnail: {
        url: 'http://example.com/thumbnail.jpg',
      } as any,
    });

    const style = wrapper.find('.link-preview__banner-image').prop('style') || {};

    expect(style.height).toEqual(undefined);
    expect(wrapper.find('.link-preview__banner-image').prop('autoHeight')).toBeTruthy();
  });

  it('it passes transparent background to options for twitter preview', function () {
    const url = 'http://example.com/thumbnail.jpg';

    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Twitter',
      authorName: 'bob',
      width: 325,
      thumbnail: {
        url,
        width: 100,
        height: 300,
      },
    });

    const imageOptions: any = wrapper.find('.link-preview__banner-image').prop('options');

    expect(imageOptions.background).toEqual('transparent');
  });

  it('it does not include background option when not twitter preview', function () {
    const url = 'http://example.com/thumbnail.jpg';

    const wrapper = subject({
      title: 'This is the best preview',
      providerName: 'Google',
      authorName: 'bob',
      width: 325,
      thumbnail: {
        url,
        width: 100,
        height: 300,
      },
    });

    const imageOptions: any = wrapper.find('.link-preview__banner-image').prop('options');

    expect(imageOptions.background).toEqual(undefined);
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

  it('it renders video with url if type is Video', function () {
    const url = 'http://example.com/the-video.avi';

    const wrapper = subject({
      type: LinkPreviewType.Video,
      url,
      thumbnail: {
        url: 'http://example.com/thumbnail.jpg',
        width: 100,
        height: 300,
      },
    });

    expect(wrapper.find('.link-preview__banner-video').prop('url')).toEqual(url);
  });
});
