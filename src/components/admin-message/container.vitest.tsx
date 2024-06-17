import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';

import { AdminMessageContainer } from './container';
import { AdminMessageType } from '../../store/messages';

describe('AdminMessage', () => {
  it('should render admin message if isAdmin is true', () => {
    renderWithProviders(
      <AdminMessageContainer
        // @ts-ignore
        message={{
          message: 'some message',
          isAdmin: true,
          admin: { type: AdminMessageType.JOINED_ZERO, inviterId: 'inviter-id', inviteeId: 'current-user' },
        }}
      />,
      {
        preloadedState: {
          authentication: {
            user: {
              // @ts-ignore
              data: { id: 'current-user' },
            },
          },
          normalized: {
            users: {
              'inviter-id': { id: 'inviter-id', firstName: 'Courtney' },
            },
          },
        },
      }
    );

    expect(screen.getByText('You joined Courtney on ZERO')).toBeTruthy();
  });

  it('should render normal message if isAdmin is false', () => {
    renderWithProviders(
      <AdminMessageContainer
        // @ts-ignore
        message={{
          message: 'some message',
          isAdmin: false,
        }}
      />
    );

    expect(screen.getByText('some message')).toBeTruthy();
  });
});
