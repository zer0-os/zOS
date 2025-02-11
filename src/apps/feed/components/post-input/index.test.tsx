import React from 'react';
import { shallow } from 'enzyme';
import { PostInput, Properties } from '.';
import { Key } from '../../../../lib/keyboard-search';
import Dropzone from 'react-dropzone';
import { config } from '../../../../config';
import { Button } from '@zero-tech/zui/components/Button';
import { ViewModes } from '../../../../shared-components/theme-engine';

describe('PostInput', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      viewMode: ViewModes.Dark,
      onSubmit: () => undefined,
      onPostInputRendered: () => undefined,
      clipboard: {
        addPasteListener: (_) => {},
        removePasteListener: (_) => {},
      },
      ...props,
    };

    return shallow(<PostInput {...allProps}>{child}</PostInput>);
  };

  it('does not submit post when post state is empty', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });
    const dropzone = wrapper.find(Dropzone).shallow();

    const textarea = dropzone.find('textarea');
    textarea.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits post when Enter is pressed', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });
    const dropzone = wrapper.find(Dropzone).shallow();

    const textarea = dropzone.find('textarea');
    textarea.simulate('change', { target: { value: 'Hello' } });
    textarea.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Hello', []);
  });

  it('submits post when Enter is pressed and images have been added', () => {
    const onSubmit = jest.fn();
    const dropzoneToMedia = (files) => files;
    const wrapper = subject({ onSubmit, dropzoneToMedia });
    const dropzone = wrapper.find(Dropzone).shallow();

    const textarea = dropzone.find('textarea');
    wrapper.find(Dropzone).simulate('drop', [{ name: 'image1' }]);
    textarea.simulate('keydown', { preventDefault() {}, key: Key.Enter, shiftKey: false });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('', [{ name: 'image1' }]);
  });

  it('submits post when submit button is clicked', () => {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });
    const dropzone = wrapper.find(Dropzone).shallow();

    dropzone.find('textarea').simulate('change', { target: { value: 'Hello' } });
    dropzone.find(Button).simulate('press');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('Hello', []);
  });

  it('submits post when submit button is clicked and images have been added', () => {
    const onSubmit = jest.fn();
    const dropzoneToMedia = (files) => files;
    const wrapper = subject({ onSubmit, dropzoneToMedia });
    const dropzone = wrapper.find(Dropzone).shallow();

    wrapper.find(Dropzone).simulate('drop', [{ name: 'image1' }]);
    dropzone.find(Button).simulate('press');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('', [{ name: 'image1' }]);
  });

  it('renders Dropzone with correct mime types and max size', () => {
    const wrapper = subject({});
    const dropZone = wrapper.find(Dropzone);

    expect(dropZone.prop('accept')).toEqual({ 'image/*': [] });
    expect(dropZone.prop('maxSize')).toEqual(config.cloudinary.max_file_size);
  });

  it('call after render', () => {
    const onPostInputRendered = jest.fn();

    subject({ onPostInputRendered });

    expect(onPostInputRendered).toHaveBeenCalledWith({
      current: null,
    });
  });
});
