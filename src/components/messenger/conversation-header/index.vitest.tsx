import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ConversationHeader, Properties } from '.';
import { stubUser } from '../../../store/test/store';

const mockGroupManagementMenu = vi.fn();

vi.mock('../../group-management-menu', () => ({
  GroupManagementMenu: (props) => {
    mockGroupManagementMenu(props);
    return <div data-testid='group-management-menu' />;
  },
}));

const subject = (props: Partial<Properties> = {}) => {
  const allProps: Properties = {
    isOneOnOne: false,
    otherMembers: [],
    name: '',
    toggleSecondarySidekick: () => null,

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
  });
});
