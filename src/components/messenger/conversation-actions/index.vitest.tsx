import { vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { ConversationActions, Properties } from '.';

const mockGroupManagementMenu = vi.fn();

vi.mock('../../group-management-menu', () => ({
  GroupManagementMenu: (props) => {
    mockGroupManagementMenu(props);
    return <div data-testid='group-management-menu' />;
  },
}));

const subject = (props: Partial<Properties> = {}) => {
  const allProps: Properties = {
    canAddMembers: false,
    canLeaveRoom: false,
    canEdit: false,
    canViewDetails: false,
    isSecondarySidekickOpen: false,
    isRoomMuted: false,
    onAddMember: () => null,
    onEdit: () => null,
    onLeaveRoom: () => null,
    onViewDetails: () => null,
    toggleSecondarySidekick: () => null,
    onMuteRoom: () => null,
    onUnmuteRoom: () => null,
    canReportUser: false,
    onReportUser: () => null,
    ...props,
  };

  return <ConversationActions {...allProps} />;
};

describe(ConversationActions, () => {
  it('fires toggleSecondarySidekick', function () {
    const toggleSecondarySidekick = vi.fn();
    const { container } = render(subject({ toggleSecondarySidekick }));
    const groupButton = container.querySelector('.conversation-actions__group-button');
    fireEvent.click(groupButton);
    expect(toggleSecondarySidekick).toHaveBeenCalledOnce();
  });

  describe('group management', function () {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('onAddMember', function () {
      const onAddMember = vi.fn();
      render(subject({ onAddMember }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onStartAddMember();

      expect(onAddMember).toHaveBeenCalled();
    });

    it('onEdit', function () {
      const onEdit = vi.fn();
      render(subject({ onEdit }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onEdit();

      expect(onEdit).toHaveBeenCalled();
    });

    it('onLeaveRoom', function () {
      const onLeaveRoom = vi.fn();
      render(subject({ onLeaveRoom }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onLeave();

      expect(onLeaveRoom).toHaveBeenCalled();
    });

    it('onViewDetails', function () {
      const onViewDetails = vi.fn();
      render(subject({ onViewDetails }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onViewGroupInformation();

      expect(onViewDetails).toHaveBeenCalled();
    });

    it('onMuteRoom', function () {
      const onMuteRoom = vi.fn();
      render(subject({ onMuteRoom }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onMute();

      expect(onMuteRoom).toHaveBeenCalled();
    });

    it('onUnmuteRoom', function () {
      const onUnmuteRoom = vi.fn();
      render(subject({ onUnmuteRoom }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onUnmute();

      expect(onUnmuteRoom).toHaveBeenCalled();
    });

    it('onReportUser', function () {
      const onReportUser = vi.fn();
      render(subject({ onReportUser, canReportUser: true }));
      const lastCall = mockGroupManagementMenu.mock.lastCall[0];
      lastCall.onReportUser();

      expect(onReportUser).toHaveBeenCalled();
    });
  });
});
