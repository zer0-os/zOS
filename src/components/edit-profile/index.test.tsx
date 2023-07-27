import React from 'react';
import { shallow } from 'enzyme';
import { EditProfile, Properties } from './index';
import { IconButton, Alert, Button, Input } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';
import { inputEvent } from '../../test/utils';
import { ImageUpload } from '../image-upload';

describe('EditProfile', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      currentDisplayName: 'John Doe',
      currentProfileImage: 'profile.jpg',
      changesSaved: false,
      onEdit: () => null,
      onClose: () => null,
      ...props,
    };

    return shallow(<EditProfile {...allProps} />);
  };

  it('renders header with title and close button', () => {
    const wrapper = subject({});
    expect(wrapper.find('.edit-profile__header').length).toEqual(1);
    expect(wrapper.find('.edit-profile__title').text()).toEqual('Edit Profile');
    expect(wrapper.find(IconButton).props().Icon).toEqual(IconXClose);
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    const wrapper = subject({ onClose: onCloseMock });

    wrapper.find(IconButton).simulate('click');
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('renders body with ImageUpload and Input', () => {
    const wrapper = subject({});
    expect(wrapper.find('.edit-profile__body').length).toEqual(1);
    expect(wrapper.find(ImageUpload).props().imageSrc).toEqual('profile.jpg');
    expect(wrapper.find(Input).props().label).toEqual('Display Name');
  });

  it('calls onEdit when Save Changes button is clicked', () => {
    const onEditMock = jest.fn();
    const wrapper = subject({ onEdit: onEditMock });

    wrapper.find('Button').simulate('press');
    expect(onEditMock).toHaveBeenCalledWith({ name: 'John Doe', image: null });
  });

  it('disables Save Changes button when name is empty', () => {
    const wrapper = subject({ currentDisplayName: '', currentProfileImage: null });

    expect(wrapper.find(Button).prop('isDisabled')).toEqual(true);
  });

  it('disables Save Changes button when loading', () => {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find(Button).prop('isDisabled')).toEqual(true);
  });

  it('disables Save Changes button when no changes are made', () => {
    const wrapper = subject({ currentDisplayName: 'John Doe', currentProfileImage: 'profile.jpg' });

    expect(wrapper.find(Button).prop('isDisabled')).toEqual(true);
  });

  it('enables Save Changes button when changes are made', () => {
    const wrapper = subject({ currentDisplayName: 'John Doe', currentProfileImage: null });

    wrapper.find(Input).simulate('change', 'Jane Smith');
    expect(wrapper.find(Button).prop('isDisabled')).toEqual(false);
  });

  it('calls onEdit with correct data when Save Changes button is clicked', () => {
    const onEditMock = jest.fn();
    const wrapper = subject({ onEdit: onEditMock });

    const formData = {
      name: 'Jane Smith',
      image: 'new-image.jpg', // note: this is actually supposed to be a nodejs FILE object
    };

    wrapper.find(Input).simulate('change', formData.name);
    wrapper.find(ImageUpload).simulate('change', formData.image);
    wrapper.find(Button).simulate('press', inputEvent());

    expect(onEditMock).toHaveBeenCalledWith(formData);
  });

  it('renders image errors', () => {
    const wrapper = subject({ errors: { image: 'error uploading image' } });

    expect(wrapper.find('Alert').prop('children')).toEqual('error uploading image');
  });

  it('renders name error when name is empty', () => {
    const wrapper = subject({ currentDisplayName: '' });

    expect(wrapper.find(Input).prop('alert')).toEqual({ variant: 'error', text: 'name cannot be empty' });
  });

  it('does not render name error when name is not empty', () => {
    const wrapper = subject({ currentDisplayName: 'John Doe' });

    expect(wrapper.find(Input).prop('alert')).toBeNull();
  });

  it('renders general errors', () => {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find(Alert).prop('children')).toEqual('invalid');
  });

  it('renders changesSaved message when changesSaved is true', () => {
    const wrapper = subject({ changesSaved: true });

    expect(wrapper.find(Alert).prop('children')).toEqual('Your changes have been saved');
  });

  it('does not render changesSaved message when changesSaved is false', () => {
    const wrapper = subject({ changesSaved: false });

    expect(wrapper.find(Alert).exists()).toBe(false);
  });
});
