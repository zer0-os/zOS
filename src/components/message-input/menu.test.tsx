import React from 'react';

import { shallow } from 'enzyme';
import Dropzone from 'react-dropzone';

import Menu, { Properties } from './menu';

describe('Menu', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onSelected: jest.fn(),
      ...props,
    };

    return shallow(<Menu {...allProps} />);
  };

  it('renders Dropzone', function () {
    const wrapper = subject({});

    expect(wrapper.find(Dropzone).exists()).toBe(true);
  });

  it('dropzone accept all type of images, text, .pdf, .doc files', function () {
    const mimeTypes = {
      'image/*': [],
      'text/*': [],
      'application/pdf': [],
      'application/zip': [],
      'application/msword': [],
    };

    const wrapper = subject({ mimeTypes });
    const dropZone = wrapper.find(Dropzone);
    expect(dropZone.prop('accept')).toEqual(mimeTypes);
  });

  it('dropzone max size', function () {
    const maxSize = 1234;

    const wrapper = subject({ maxSize });
    const dropZone = wrapper.find(Dropzone);
    expect(dropZone.prop('maxSize')).toEqual(maxSize);
  });
});
