import { shallow } from 'enzyme';

import { EditConversationPanel, Properties } from '.';
import { ImageUpload } from '../../../image-upload';
import { buttonLabelled } from '../../../../test/utils';
import { Alert } from '@zero-tech/zui/components';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';
import { EditConversationState } from '../../../../store/group-management/types';

describe(EditConversationPanel, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      currentUser: { userId: 'current-user' } as User,
      otherMembers: [],
      onBack: () => null,
      onEdit: () => null,
      state: EditConversationState.NONE,
      errors: {},
      name: '',
      icon: '',
      conversationAdminIds: [],
      onMemberSelected: () => null,
      openUserProfile: () => null,
      ...props,
    };

    return shallow(<EditConversationPanel {...allProps} />);
  };

  describe('Edit Group Icon & Name', () => {
    it('renders body with ImageUpload and Input', () => {
      const wrapper = subject({ name: 'Display Name', icon: 'icon-url' });
      expect(wrapper.find('.edit-conversation-panel__body').length).toEqual(1);
      expect(wrapper.find(ImageUpload).props().imageSrc).toEqual('icon-url');
    });

    it('disables Save Changes button when name is empty', () => {
      const wrapper = subject({ name: '', icon: '' });
      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('disables Save Changes button when no changes are made', () => {
      const wrapper = subject({ name: 'Display Name', icon: 'icon-url' });

      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('enables Save Changes button when changes are made', () => {
      const wrapper = subject({ name: 'Display Name', icon: 'icon-url' });

      wrapper.find('Input[name="name"]').simulate('change', 'Jane Smith');
      expect(saveButton(wrapper).prop('isDisabled')).toEqual(false);
    });

    it('does not render name error when name is empty', () => {
      const wrapper = subject({ name: '', icon: 'some-url' });

      expect(wrapper.find('Input[name="name"]').prop('alert')).toBe(undefined);
    });

    it('does not render name error when name is not empty', () => {
      const wrapper = subject({ name: 'John Doe' });

      expect(wrapper.find('Input[name="name"]').prop('alert')).toBe(undefined);
    });

    it('does not render image errror when image is empty', () => {
      const wrapper = subject({ icon: '' });

      expect(wrapper.find(ImageUpload).prop('isError')).toBe(false);
    });

    it('renders general errors', () => {
      const wrapper = subject({ errors: { general: 'invalid' } });

      expect(wrapper.find(Alert).prop('children')).toEqual('invalid');
    });

    it('disables Save Changes button when editProfileState is INPROGRESS', () => {
      const wrapper = subject({ state: EditConversationState.INPROGRESS });

      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('calls onEdit with correct data when Save Changes button is clicked', () => {
      const onEditMock = jest.fn();
      const wrapper = subject({ onEdit: onEditMock });

      const formData = {
        name: 'Jane Smith',
        image: 'new-image.jpg', // note: this is actually supposed to be a nodejs FILE object
      };

      wrapper.find('Input[name="name"]').simulate('change', formData.name);
      wrapper.find(ImageUpload).simulate('change', formData.image);
      saveButton(wrapper).simulate('press');

      expect(onEditMock).toHaveBeenCalledWith(formData.name, formData.image);
    });

    it('renders changesSaved message when editProfileState is SUCCESS', () => {
      const wrapper = subject({ state: EditConversationState.SUCCESS });

      expect(wrapper.find(Alert).prop('children')).toEqual('Changes saved');
    });

    it('does not render changesSaved message when editProfileState is not SUCCESS', () => {
      const wrapper = subject({ state: EditConversationState.NONE });

      expect(wrapper.find(Alert).exists()).toBe(false);
    });
  });

  describe('Members', () => {
    it('renders the members of the conversation', function () {
      const wrapper = subject({
        currentUser: { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' } as any,
        otherMembers: [
          { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
          { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
        ] as User[],
      });

      expect(wrapper.find(CitizenListItem).map((c) => c.prop('user'))).toEqual([
        { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' },
        { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
      ]);
    });

    it('passes canRemoveMembers as false to CitizenListItem if only 2 members in group', function () {
      const wrapper = subject({
        currentUser: { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' } as any,
        otherMembers: [
          { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        ] as User[],
      });

      expect(wrapper.find(CitizenListItem).at(1).prop('canRemove')).toEqual(false);
    });

    it('passes canRemoveMembers as true to CitizenListItem if more than 2 members in group', function () {
      const wrapper = subject({
        currentUser: { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' } as any,
        otherMembers: [
          { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
          { userId: 'otherMember2', matrixId: 'matrix-id-2', firstName: 'Charlie' },
          { userId: 'otherMember3', matrixId: 'matrix-id-3', firstName: 'Eve' },
        ] as User[],
      });

      expect(wrapper.find(CitizenListItem).at(1).prop('canRemove')).toEqual(true);
    });

    it('passes showMemberManagementMenu as true to CitizenListItem', function () {
      const wrapper = subject({
        otherMembers: [
          { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        ] as User[],
      });

      expect(wrapper.find(CitizenListItem).at(1).prop('showMemberManagementMenu')).toEqual(true);
    });

    it('publishes onMemberSelected event', () => {
      const onMemberSelected = jest.fn();
      const otherMembers = [
        { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
      ] as User[];

      const wrapper = subject({ onMemberSelected, otherMembers });

      wrapper.find(CitizenListItem).at(1).simulate('selected', 'otherMember1');

      expect(onMemberSelected).toHaveBeenCalled();
    });

    it('publishes openUserProfile event', () => {
      const openUserProfile = jest.fn();

      const wrapper = subject({
        openUserProfile,
        currentUser: { userId: 'currentUser', matrixId: 'matrix-id-4', firstName: 'Tom' } as any,
      });

      wrapper.find(CitizenListItem).at(0).simulate('selected', 'currentUser');

      expect(openUserProfile).toHaveBeenCalled();
    });

    it('does not allow remove if there are only 2 people in the room', function () {
      const wrapper = subject({
        otherMembers: [
          { userId: 'otherMember1', matrixId: 'matrix-id-1', firstName: 'Adam' },
        ] as User[],
      });

      const item = wrapper.find(CitizenListItem).findWhere((c) => c.prop('user').userId === 'otherMember1');

      expect(item.prop('onRemove')).toBeFalsy();
    });
  });
});

function saveButton(wrapper) {
  return buttonLabelled(wrapper, 'Save');
}
