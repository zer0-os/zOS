import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { ConversationHeader, Properties } from '.';
import { stubUser } from '../../../../store/test/store';

const mockGroupManagementMenu = vi.fn();

vi.mock('../../../group-management-menu', () => ({
  GroupManagementMenu: (props) => {
    mockGroupManagementMenu(props);
    return <div data-testid='group-management-menu' />;
  },
}));

const subject = (props: Partial<Properties> = {}) => {
  const allProps: Properties = {
    isOneOnOne: false,
    otherMembers: [],
    icon: '',
    name: '',
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

    ...props,
  };

  return <ConversationHeader {...allProps} />;
};

describe(ConversationHeader, () => {
  describe('title', () => {
    it('renders channel name as title when name is provided', () => {
      render(subject({ name: 'this is my channel name' }));

      expect(screen.getByText('this is my channel name')).toBeTruthy();
    });

    it('renders otherMembers as title when name is NOT provided', () => {
      render(subject({ otherMembers: [stubUser({ firstName: 'first-name', lastName: 'last-name' })] }));

      expect(screen.getByText('first-name last-name')).toBeTruthy();
    });
  });

  describe('one on one chat', function () {
    it('header renders full name in the title', function () {
      render(
        subject({
          otherMembers: [stubUser({ firstName: 'Johnny', lastName: 'Sanderson' })],
        })
      );

      expect(screen.getByText('Johnny Sanderson')).toBeTruthy();
    });

    it('renders a formatted subtitle', function () {
      render(
        subject({
          isOneOnOne: true,
          otherMembers: [stubUser({ displaySubHandle: '0://arc:vet', lastSeenAt: null })],
        })
      );

      expect(screen.getByText('0://arc:vet')).toBeTruthy();
    });
  });

  describe('one to many chat', function () {
    it('header renders full names in the title', function () {
      render(
        subject({
          isOneOnOne: false,
          otherMembers: [
            stubUser({ firstName: 'Johnny', lastName: 'Sanderson' }),
            stubUser({ firstName: 'Jack', lastName: 'Black' }),
          ],
        })
      );

      expect(screen.getByText('Johnny Sanderson, Jack Black')).toBeTruthy();
    });

    it('fires toggleSecondarySidekick', function () {
      const toggleSecondarySidekick = vi.fn();
      const { container } = render(subject({ isOneOnOne: false, toggleSecondarySidekick }));
      const groupButton = container.querySelector('.conversation-header__group-button');
      fireEvent.click(groupButton);
      expect(toggleSecondarySidekick).toHaveBeenCalledOnce();
    });
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
  });
});
