import { shallow } from 'enzyme';

import { GroupManagement, Properties } from '.';
import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';

describe('GroupManagement', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      groupManagementStage: Stage.None,
      isAddingMembers: false,
      backGroupManagement: () => null,
      usersInMyNetworks: () => null,
      onSubmitSelectedMembers: () => null,
      ...props,
    };

    return shallow(<GroupManagement {...allProps} />);
  };

  it('renders AddMembersPanel', function () {
    let wrapper = subject({ groupManagementStage: Stage.StartAddMemberToRoom });

    expect(wrapper).toHaveElement(AddMembersPanel);
  });

  it('does not render AddMembersPanel if group management stage is none', function () {
    const wrapper = subject({ groupManagementStage: Stage.None });

    expect(wrapper).not.toHaveElement(GroupManagement);
  });

  it('moves back from AddMembersPanel', async function () {
    const backGroupManagement = jest.fn();
    const wrapper = subject({
      groupManagementStage: Stage.StartAddMemberToRoom,
      backGroupManagement,
    });

    await wrapper.find(AddMembersPanel).simulate('back');

    expect(backGroupManagement).toHaveBeenCalledOnce();
  });

  it('searches for citizens when adding new members', async function () {
    const usersInMyNetworks = jest.fn();
    const wrapper = subject({
      groupManagementStage: Stage.StartAddMemberToRoom,
      usersInMyNetworks,
    });

    await wrapper.find(AddMembersPanel).prop('searchUsers')('jac');

    expect(usersInMyNetworks).toHaveBeenCalledWith('jac');
  });

  it('sets AddMembersPanel to Submitting while data is loading', async function () {
    const wrapper = subject({
      groupManagementStage: Stage.StartAddMemberToRoom,
      isAddingMembers: true,
    });

    expect(wrapper.find(AddMembersPanel).prop('isSubmitting')).toBeTrue();
  });

  it('submits selected members for addition to the specified room', async function () {
    const mockAddSelectedMembersToRoom = jest.fn();
    const mockActiveConversationId = 'active-channel-id';

    const onSubmitSelectedMembers = (selectedOptions) => {
      mockAddSelectedMembersToRoom({ roomId: mockActiveConversationId, users: selectedOptions });
    };

    const wrapper = subject({
      onSubmitSelectedMembers,
      groupManagementStage: Stage.StartAddMemberToRoom,
    });

    await wrapper.find(AddMembersPanel).prop('onSubmit')([{ value: 'id-1', label: 'name-1' }]);

    expect(mockAddSelectedMembersToRoom).toHaveBeenCalledWith({
      roomId: mockActiveConversationId,
      users: [{ value: 'id-1', label: 'name-1' }],
    });
  });
});
