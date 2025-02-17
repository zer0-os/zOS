import { ConversationActionsContainer } from './container';

import { StoreBuilder, stubAuthenticatedUser, stubConversation, stubUser } from '../../../store/test/store';

describe('ConversationActionsContainer', () => {
  describe('mapState', () => {
    describe('canLeaveRoom', () => {
      it('is false when only when one other member', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ otherMembers: [stubUser()], isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: false })
        );
      });

      it('is false when user is admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({
              otherMembers: [stubUser(), stubUser()],
              adminMatrixIds: ['current-user-matrix-id'],
              isSocialChannel: false,
            })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: false })
        );
      });

      it('is false when user is admin and conversation is social channel', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({
              otherMembers: [stubUser(), stubUser()],
              adminMatrixIds: ['current-user-matrix-id'],
              isSocialChannel: true,
            })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: false })
        );
      });

      it('is false when the conversation is social channel', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({
              otherMembers: [stubUser(), stubUser()],
              adminMatrixIds: ['other-user-matrix-id'],
              isSocialChannel: true,
            })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: false })
        );
      });

      it('is true when user is not admin and more than one other member', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ otherMembers: [stubUser(), stubUser()], adminMatrixIds: ['other-user-matrix-id'] })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: true })
        );
      });

      it('is true when the conversation has multiple members', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ otherMembers: [stubUser(), stubUser()] }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: true })
        );
      });

      it('is false when the conversation is a social channel and has only one member', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ otherMembers: [stubUser()], isSocialChannel: true }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canLeaveRoom: false })
        );
      });
    });

    describe('canEdit', () => {
      it('is false when one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: true, isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: false })
        );
      });

      it('is false when current user is not room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['other-user-matrix-id'], isSocialChannel: false })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: false })
        );
      });

      it('is true when current user is room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'], isSocialChannel: false })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: true })
        );
      });

      it('is true when current user is room moderator', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, moderatorIds: ['current-user-id'], isSocialChannel: false })
          )
          .withCurrentUser(stubAuthenticatedUser({ id: 'current-user-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: true })
        );
      });

      it('is true when the user is an admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'] }))
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: true })
        );
      });

      it('is false when the conversation is a social channel and current user is admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'], isSocialChannel: true })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: false })
        );
      });

      it('is false when the conversation is a social channel and current user is not room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['other-user-matrix-id'], isSocialChannel: true })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canEdit: false })
        );
      });
    });

    describe('canAddMembers', () => {
      it('is false when one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: true, isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canAddMembers: false })
        );
      });

      it('is false when current user is not room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['other-user-matrix-id'], isSocialChannel: false })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canAddMembers: false })
        );
      });

      it('is true when current user is room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'], isSocialChannel: false })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canAddMembers: true })
        );
      });

      it('is false when the conversation is a social channel', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['current-user-matrix-id'], isSocialChannel: true })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canAddMembers: false })
        );
      });

      it('is false when the conversation is a social channel and current user is not room admin', () => {
        const state = new StoreBuilder()
          .withActiveConversation(
            stubConversation({ isOneOnOne: false, adminMatrixIds: ['other-user-matrix-id'], isSocialChannel: true })
          )
          .withCurrentUser(stubAuthenticatedUser({ matrixId: 'current-user-matrix-id' }));

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canAddMembers: false })
        );
      });
    });

    describe('canViewDetails', () => {
      it('is false when one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: true, isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canViewDetails: false })
        );
      });

      it('is true when not a one on one conversation', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: false, isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canViewDetails: true })
        );
      });

      it('is true when the conversation is a social channel', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({
            isOneOnOne: false,
            isSocialChannel: true,
          })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canViewDetails: true })
        );
      });
    });

    describe('canReportUser', () => {
      it('is true when the conversation is one on one', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: true, isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canReportUser: true })
        );
      });

      it('is false when the conversation is not one on one ', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: false, isSocialChannel: false })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canReportUser: false })
        );
      });

      it('is false when the conversation is a social channel', () => {
        const state = new StoreBuilder().withActiveConversation(
          stubConversation({ isOneOnOne: false, isSocialChannel: true })
        );

        expect(ConversationActionsContainer.mapState(state.build())).toEqual(
          expect.objectContaining({ canReportUser: false })
        );
      });
    });
  });
});
