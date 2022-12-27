import React from 'react';

import { shallow } from 'enzyme';
import ImageCard, { Properties } from './image-card';

describe('Menu', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      image: { id: '', name: '', url: '' },
      onRemoveImage: jest.fn(),
      ...props,
    };

    return shallow(<ImageCard {...allProps} />);
  };

  it('renders image card', function () {
    const wrapper = subject({});

    expect(wrapper.find('.image-card__image').exists()).toBe(true);
  });

  it('renders image name', function () {
    const image = { id: 'id1', name: 'image1', url: 'url_image' };
    const wrapper = subject({ image, size: 'small' });

    expect(wrapper.find('.image-card__image img').prop('title')).toEqual(image.name);
  });

  it('should call remove image when remove icon clicked', function () {
    const onRemoveImage = jest.fn();
    const wrapper = subject({ onRemoveImage, size: 'small' });

    wrapper.find('.image-card__delete').simulate('click');

    expect(onRemoveImage).toHaveBeenCalledOnce();
  });
});
