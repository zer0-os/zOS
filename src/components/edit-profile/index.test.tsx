/**
 * @jest-environment jsdom
 */

import React, { act } from 'react';
import { mount } from 'enzyme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { EditProfile, Properties } from './index';
import { Alert } from '@zero-tech/zui/components';
import { ImageUpload } from '../../components/image-upload';
import { State as EditProfileState } from '../../store/edit-profile';
import { buttonLabelled } from '../../test/utils';

const featureFlags = { allowEditPrimaryZID: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

const queryClient = new QueryClient();

jest.mock('../../lib/hooks/useMatrixImage', () => ({
  useMatrixImage: (image: string) => ({ data: image }),
}));

describe('EditProfile', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      editProfileState: EditProfileState.NONE,
      errors: {},
      currentDisplayName: 'John Doe',
      currentProfileImage: 'profile.jpg',
      currentPrimaryZID: '0://john:doe',
      ownedZIDs: [],
      loadingZIDs: false,
      onEdit: () => null,
      onClose: () => null,
      ...props,
    };

    return mount(
      <QueryClientProvider client={queryClient}>
        <EditProfile {...allProps} />
      </QueryClientProvider>
    );
  };

  it('renders body with ImageUpload and Input', () => {
    const wrapper = subject({});
    expect(wrapper.find('.edit-profile__body').length).toEqual(1);
    expect(wrapper.find(ImageUpload).props().imageSrc).toEqual('profile.jpg');
    expect(wrapper.find('Input[name="name"]').props().label).toEqual('Display Name');
  });

  it('calls onEdit when Save Changes button is clicked', () => {
    const onEditMock = jest.fn();
    const wrapper = subject({ onEdit: onEditMock });

    act(() => {
      saveButton(wrapper).prop('onPress')();
    });

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

  it('renders dropdown with ownedZIDs with the primaryZID as the first option and NONE(wallet address) as the last', () => {
    featureFlags.allowEditPrimaryZID = true;

    const wrapper = subject({
      currentPrimaryZID: '0://jane:smith',
      ownedZIDs: ['0://john:doe', '0://jane:smith', '0://jijitsu:kaezen'],
    });

    const dropdown = wrapper.find('SelectInput');
    const items: any = dropdown.prop('items');

    expect(items.length).toEqual(4);
    expect(items[0].id).toEqual('0://jane:smith');
    expect(items[3].id).toEqual('None (wallet address)');
  });

  it('does not render NONE (wallet address) option, if primaryZID is not set', () => {
    featureFlags.allowEditPrimaryZID = true;

    const wrapper = subject({
      currentPrimaryZID: '', // none
      ownedZIDs: ['0://john:doe'],
    });

    const dropdown = wrapper.find('SelectInput');
    const items: any = dropdown.prop('items');

    expect(items.length).toEqual(1); // NONE option is not rendered
    expect(items[0].id).toEqual('0://john:doe');
  });

  it('renders dropdown with loading state when fetching ownedZIDs', () => {
    featureFlags.allowEditPrimaryZID = true;

    const wrapper = subject({ currentPrimaryZID: '0://jane:smith', loadingZIDs: true });

    const dropdown = wrapper.find('SelectInput');
    const items: any = dropdown.prop('items');

    expect(items.length).toEqual(1);
    expect(items[0].id).toEqual('Fetching ZERO IDs');
  });

  it('calls onEdit with correct data when Save Changes button is clicked', () => {
    featureFlags.allowEditPrimaryZID = true;

    const onEditMock = jest.fn();

    const formData = {
      name: 'Jane Smith',
      image: 'new-image.jpg', // note: this is actually supposed to be a nodejs FILE object
      primaryZID: '0://jane:smith',
    };

    onEditMock(formData);

    expect(onEditMock).toHaveBeenCalledWith(formData);
  });

  it('renders image errors', () => {
    const wrapper = subject({ errors: { image: 'error uploading image' } });

    const alert = wrapper.find(Alert).first();
    expect(alert.exists()).toBe(true);
    expect(alert.prop('variant')).toBe('error');
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

    const alert = wrapper.find(Alert).first();
    expect(alert.exists()).toBe(true);
    expect(alert.prop('variant')).toBe('error');
  });

  it('renders changesSaved message when editProfileState is SUCCESS', () => {
    const wrapper = subject({ editProfileState: EditProfileState.SUCCESS });

    const alert = wrapper.find(Alert).first();
    expect(alert.exists()).toBe(true);
    expect(alert.prop('variant')).toBe('success');
    expect(alert.prop('className')).toBe('edit-profile__alert-small');
  });

  it('does not render changesSaved message when editProfileState is not SUCCESS', () => {
    const wrapper = subject({ editProfileState: EditProfileState.NONE });

    expect(wrapper.find(Alert).exists()).toBe(false);
  });
});

function saveButton(wrapper) {
  return buttonLabelled(wrapper, 'Save Changes');
}
