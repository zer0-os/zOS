import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import { RootState } from '../../../store/reducer';
import { GroupManagementState, LeaveGroupDialogStatus } from '../../../store/group-management';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      status: LeaveGroupDialogStatus.CLOSED,
      groupName: 'group-name',
      roomId: 'id',
      onClose: () => null,
      leaveGroup: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', () => {
    const wrapper = subject({ status: LeaveGroupDialogStatus.OPEN });

    expect(wrapper.find('LeaveGroupDialog').props()).toEqual(
      expect.objectContaining({
        status: LeaveGroupDialogStatus.OPEN,
        name: 'group-name',
      })
    );
  });

  describe('mapState', () => {
    const subject = (groupManagementState: Partial<GroupManagementState> = {}) => {
      const state = {
        groupManagement: { leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED, ...groupManagementState },
      } as RootState;
      return Container.mapState(state);
    };

    it('status', () => {
      const props = subject({ leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN });

      expect(props.status).toEqual(LeaveGroupDialogStatus.OPEN);
    });
  });
});
