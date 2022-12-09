import React from 'react';

import { shallow } from 'enzyme';
import Dropzone from 'react-dropzone';

import { ImageUpload, Properties } from '.';

let featureFlags: any = {};

describe('feature-flag', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onChange: jest.fn(),
      ...props,
    };

    return shallow(<ImageUpload {...allProps} />);
  };

  it('renders Dropzone', function () {
    const wrapper = subject({});

    expect(wrapper.find(Dropzone).exists()).toBe(true);
  });

  it('dropzone accept all type of images', function () {
    featureFlags.tacos = true;

    const wrapper = subject({});
    const dropZone = wrapper.find(Dropzone);
    expect(dropZone.prop('accept')).toEqual({
      'image/*': [],
    });
  });

  it('dropzone max files 1', function () {
    featureFlags.tacos = true;

    const wrapper = subject({});
    const dropZone = wrapper.find(Dropzone);
    expect(dropZone.prop('maxFiles')).toEqual(1);
  });
});
