import React from 'react';
import { shallow } from 'enzyme';
import { EditProfile, Properties } from './index';
import { IconButton, Alert } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';
import { ImageUpload } from '../../components/image-upload';
import { State as EditProfileState } from '../../store/edit-profile';
import { buttonLabelled } from '../../test/utils';

const featureFlags = { internalUsage: false, allowEditPrimaryZID: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe('EditProfile', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      editProfileState: EditProfileState.NONE, // Set the initial editProfileState to State.NONE
      errors: {},
      currentDisplayName: 'John Doe',
      currentProfileImage: 'profile.jpg',
      currentPrimaryZID: '0://john:doe',
      ownedZIDs: [],
      onEdit: () => null,
      onClose: () => null,
      onLeaveGlobal: () => null,
      onJoinGlobal: () => null,
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
    expect(wrapper.find('Input[name="name"]').props().label).toEqual('Display Name');
  });

  it('calls onEdit when Save Changes button is clicked', () => {
    const onEditMock = jest.fn();
    const wrapper = subject({ onEdit: onEditMock });

    saveButton(wrapper).simulate('press');
    expect(onEditMock).toHaveBeenCalledWith({
      name: 'John Doe',
      image: null,
      primaryZID: '0://john:doe',
    });
  });

  it('disables Save Changes button when name is empty', () => {
    const wrapper = subject({ currentDisplayName: '', currentProfileImage: null });

    expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
  });

  it('disables Save Changes button when editProfileState is INPROGRESS', () => {
    const wrapper = subject({ editProfileState: EditProfileState.INPROGRESS });

    expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
  });

  it('disables Save Changes button when no changes are made', () => {
    const wrapper = subject({
      currentDisplayName: 'John Doe',
      currentProfileImage: 'profile.jpg',
      currentPrimaryZID: '0://john:doe',
    });

    expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
  });

  it('enables Save Changes button when changes are made', () => {
    const wrapper = subject({ currentDisplayName: 'John Doe', currentProfileImage: null });

    wrapper.find('Input[name="name"]').simulate('change', 'Jane Smith');
    expect(saveButton(wrapper).prop('isDisabled')).toEqual(false);
  });

  it('renders dropdown with ownedZIDs with the primaryZID as the first option', () => {
    featureFlags.allowEditPrimaryZID = true;

    const wrapper = subject({
      currentPrimaryZID: '0://jane:smith',
      ownedZIDs: ['0://john:doe', '0://jane:smith', '0://jijitsu:kaezen'],
    });

    const dropdown = wrapper.find('SelectInput');
    const items: any = dropdown.prop('items');

    expect(items.length).toEqual(3);
    expect(items[0].id).toEqual('0://jane:smith');
  });

  it('calls onEdit with correct data when Save Changes button is clicked', () => {
    featureFlags.allowEditPrimaryZID = true;

    const onEditMock = jest.fn();
    const wrapper = subject({
      onEdit: onEditMock,
      ownedZIDs: ['0://jane:smith', '0://john:doe'],
      currentPrimaryZID: '0://john:doe',
    });

    const formData = {
      name: 'Jane Smith',
      image: 'new-image.jpg', // note: this is actually supposed to be a nodejs FILE object
      primaryZID: '0://jane:smith',
    };

    wrapper.find('Input[name="name"]').simulate('change', formData.name);
    wrapper.find(ImageUpload).simulate('change', formData.image);

    const dropdown: any = wrapper.find('SelectInput');
    const item = dropdown.prop('items').find((i) => i.id === formData.primaryZID);
    item.onSelect();

    saveButton(wrapper).simulate('press');

    expect(onEditMock).toHaveBeenCalledWith(formData);
  });

  it('renders image errors', () => {
    const wrapper = subject({ errors: { image: 'error uploading image' } });

    expect(wrapper.find(Alert).prop('children')).toEqual('error uploading image');
  });

  it('renders name error when name is empty', () => {
    const wrapper = subject({ currentDisplayName: '' });

    expect(wrapper.find('Input[name="name"]').prop('alert')).toEqual({
      variant: 'error',
      text: 'name cannot be empty',
    });
  });

  it('does not render name error when name is not empty', () => {
    const wrapper = subject({ currentDisplayName: 'John Doe' });

    expect(wrapper.find('Input[name="name"]').prop('alert')).toBeNull();
  });

  it('renders general errors', () => {
    const wrapper = subject({ errors: { general: 'invalid' } });

    expect(wrapper.find(Alert).prop('children')).toEqual('invalid');
  });

  it('renders changesSaved message when editProfileState is SUCCESS', () => {
    const wrapper = subject({ editProfileState: EditProfileState.SUCCESS });

    expect(wrapper.find(Alert).prop('children')).toEqual('Your changes have been saved');
  });

  it('does not render changesSaved message when editProfileState is not SUCCESS', () => {
    const wrapper = subject({ editProfileState: EditProfileState.NONE });

    expect(wrapper.find(Alert).exists()).toBe(false);
  });

  describe('internal features', () => {
    it('calls onLeaveGlobal when Leave Global pressed', () => {
      featureFlags.internalUsage = true;
      const onLeaveGlobal = jest.fn();
      const wrapper = subject({ onLeaveGlobal });

      leaveGlobalButton(wrapper).simulate('press');
      expect(onLeaveGlobal).toHaveBeenCalledWith();
    });

    it('calls onJoinGlobal when Join Global pressed', () => {
      featureFlags.internalUsage = true;
      const onJoinGlobal = jest.fn();
      const wrapper = subject({ onJoinGlobal });

      joinGlobalButton(wrapper).simulate('press');
      expect(onJoinGlobal).toHaveBeenCalledWith();
    });

    it('hides Global buttons if feature flag is disabled', () => {
      featureFlags.internalUsage = false;
      const onLeaveGlobal = jest.fn();
      const wrapper = subject({ onLeaveGlobal });

      expect(leaveGlobalButton(wrapper).exists()).toBe(false);
      expect(joinGlobalButton(wrapper).exists()).toBe(false);
    });
  });
});

function saveButton(wrapper) {
  return buttonLabelled(wrapper, 'Save Changes');
}

function leaveGlobalButton(wrapper) {
  return buttonLabelled(wrapper, 'Leave Global');
}

function joinGlobalButton(wrapper) {
  return buttonLabelled(wrapper, 'Join Global');
}
