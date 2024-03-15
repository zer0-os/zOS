import { Container, PublicProperties } from './container';
import { RootState } from '../../store/reducer';
import { AdminMessageType, Message } from '../../store/messages';

describe('Container', () => {
  describe('mapState', () => {
    const subject = (currentUserId: string, users = {}, publicProps: Partial<PublicProperties> = {}) => {
      const state = {
        authentication: {
          user: {
            data: { id: currentUserId },
          },
        },
        normalized: {
          users: {
            ...users,
          },
        } as any,
      } as RootState;
      return Container.mapState(state, publicProps as PublicProperties);
    };

    describe('text', () => {
      it('translates admin messages', () => {
        const props = subject(
          'current-user',
          { 'inviter-id': { id: 'inviter-id', firstName: 'Courtney' } },
          {
            message: {
              message: 'some message',
              isAdmin: true,
              admin: { type: AdminMessageType.JOINED_ZERO, inviterId: 'inviter-id', inviteeId: 'current-user' },
            } as Message,
          }
        );

        expect(props.text).toEqual('You joined Courtney on ZERO');
      });
    });
  });
});
