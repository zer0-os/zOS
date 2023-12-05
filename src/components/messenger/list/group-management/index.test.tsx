import { shallow } from 'enzyme';

import { GroupManagement, Properties } from '.';
import { Stage } from '../../../../store/group-management';
import { AddMembersPanel } from '../add-members-panel';

describe('GroupManagement', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      stage: Stage.None,
      onBack: () => null,
      searchUsers: () => null,
      ...props,
    };

    return shallow(<GroupManagement {...allProps} />);
  };

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
});
