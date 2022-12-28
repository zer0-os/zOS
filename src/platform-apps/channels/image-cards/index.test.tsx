import React from 'react';

import { shallow } from 'enzyme';
import ImageCards, { Properties } from '.';
import ImageCard from './image-card';

describe('Menu', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      images: [{ id: '', name: '', url: '' }],
      onRemoveImage: jest.fn(),
      ...props,
    };

    return shallow(<ImageCards {...allProps} />);
  };

  it('renders ImageCard', function () {
    const images = [{ id: 'id1', name: 'image1', url: 'url_image' }];
    const wrapper = subject({ images });

    expect(wrapper.find(ImageCard).exists()).toBe(true);
  });

  it('should not renders ImageCard', function () {
    const images = [];
    const wrapper = subject({ images });

    expect(wrapper.find(ImageCard).exists()).toBe(false);
  });

  it('adds image', function () {
    const images = [{ id: 'id1', name: 'image1', url: 'url_image' }];
    const wrapper = subject({ images });

    expect(wrapper.find(ImageCard).prop('image')).toEqual(images[0]);
  });
});
