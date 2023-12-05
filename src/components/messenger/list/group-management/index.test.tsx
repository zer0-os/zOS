import { shallow } from 'enzyme';

import { GroupManagement, Properties } from '.';
import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';
import { EditConversationPanel } from '../edit-conversation-panel';

describe(GroupManagement, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      stage: Stage.None,
      isAddingMembers: false,
      addMemberError: '',

      onBack: () => null,
      searchUsers: () => null,
      onAddMembers: () => null,
      ...props,
    };

    return shallow(<GroupManagement {...allProps} />);
  };

  it('renders nothing if no management stage is active', function () {
    let wrapper = subject({ stage: Stage.None });

    expect(wrapper).not.toHaveElement(AddMembersPanel);
    expect(wrapper).not.toHaveElement(EditConversationPanel);
  });

  it('renders AddMembersPanel', function () {
    let wrapper = subject({ stage: Stage.StartAddMemberToRoom });

    expect(wrapper).toHaveElement(AddMembersPanel);
  });

  it('does not render AddMembersPanel if group management stage is none', function () {
    const wrapper = subject({ stage: Stage.None });

    expect(wrapper).not.toHaveElement(GroupManagement);
  });

  it('moves back from AddMembersPanel', async function () {
    const onBack = jest.fn();
    const wrapper = subject({ stage: Stage.StartAddMemberToRoom, onBack });

    await wrapper.find(AddMembersPanel).simulate('back');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('searches for citizens when adding new members', async function () {
    const searchUsers = jest.fn();
    const wrapper = subject({ stage: Stage.StartAddMemberToRoom, searchUsers });

    await wrapper.find(AddMembersPanel).prop('searchUsers')('jac');

    expect(searchUsers).toHaveBeenCalledWith('jac');
  });

  it('sets AddMembersPanel to Submitting while adding members', async function () {
    const wrapper = subject({
      stage: Stage.StartAddMemberToRoom,
      isAddingMembers: true,
    });

    expect(wrapper.find(AddMembersPanel).prop('isSubmitting')).toBeTrue();
  });

  it('submits selected members for addition to the specified room', async function () {
    const mockAddSelectedMembers = jest.fn();
    const mockActiveConversationId = 'active-channel-id';

    const onAddMembers = (selectedOptions) => {
      mockAddSelectedMembers({ roomId: mockActiveConversationId, users: selectedOptions });
    };

    const wrapper = subject({
      onAddMembers,
      stage: Stage.StartAddMemberToRoom,
    });

    await wrapper.find(AddMembersPanel).prop('onSubmit')([{ value: 'id-1', label: 'name-1' }]);

    expect(mockAddSelectedMembers).toHaveBeenCalledWith({
      roomId: mockActiveConversationId,
      users: [{ value: 'id-1', label: 'name-1' }],
    });
  });

  it('passes addMemberError to AddMembersPanel', function () {
    const error = 'Error adding member';
    const wrapper = subject({ stage: Stage.StartAddMemberToRoom, addMemberError: error });

    expect(wrapper.find(AddMembersPanel).prop('error')).toEqual(error);
  });

  it('renders the EditConversationPanel', async function () {
    const wrapper = subject({ stage: Stage.EditConversation });

    expect(wrapper).toHaveElement(EditConversationPanel);
  });
});
