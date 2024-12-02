import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import { reset, reportUser, openReportUserModal, closeReportUserModal } from './saga';
import { reportUser as apiReportUser } from './api';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';

describe('report user saga', () => {
  describe('reset', () => {
    it('resets the state', async () => {
      const initialState = new StoreBuilder()
        .withReportUser({
          loading: true,
          errorMessage: 'error',
          successMessage: 'success',
        })
        .build();

      const {
        storeState: { reportUser },
      } = await expectSaga(reset).withReducer(rootReducer, initialState).run();

      expect(reportUser.loading).toBe(false);
      expect(reportUser.errorMessage).toBe('');
      expect(reportUser.successMessage).toBe('');
    });
  });

  describe('reportUser', () => {
    it('handles successful report', async () => {
      const payload = {
        reason: 'spam',
        comment: 'test comment',
      };

      const initialState = new StoreBuilder()
        .withReportUser({
          reportedUserId: 'user-123',
        })
        .build();

      const { storeState } = await expectSaga(reportUser, { payload })
        .withReducer(rootReducer, initialState)
        .provide([
          [
            call(apiReportUser, {
              reportedUserId: 'user-123',
              reason: 'spam',
              comment: 'test comment',
            }),
            { success: true },
          ],
        ])
        .run();

      expect(storeState.reportUser.loading).toBe(false);
      expect(storeState.reportUser.successMessage).toBe('User reported successfully');
      expect(storeState.reportUser.errorMessage).toBe('');
    });

    it('handles failed report and sets error message', async () => {
      const payload = {
        reason: 'spam',
        comment: 'test comment',
      };

      const initialState = new StoreBuilder()
        .withReportUser({
          reportedUserId: 'user-123',
        })
        .build();

      const { storeState } = await expectSaga(reportUser, { payload })
        .withReducer(rootReducer, initialState)
        .provide([
          [
            call(apiReportUser, {
              reportedUserId: 'user-123',
              reason: 'spam',
              comment: 'test comment',
            }),
            { success: false, error: 'Failed to report user' },
          ],
        ])
        .run();

      expect(storeState.reportUser.loading).toBe(false);
      expect(storeState.reportUser.errorMessage).toBe('Failed to report user');
      expect(storeState.reportUser.successMessage).toBe('');
    });

    it('handles API (unknown) errors', async () => {
      const payload = {
        reason: 'spam',
        comment: 'test comment',
      };

      const initialState = new StoreBuilder()
        .withReportUser({
          reportedUserId: 'user-123',
        })
        .build();

      const { storeState } = await expectSaga(reportUser, { payload })
        .withReducer(rootReducer, initialState)
        .provide([
          [
            call(apiReportUser, {
              reportedUserId: 'user-123',
              reason: 'spam',
              comment: 'test comment',
            }),
            Promise.reject(new Error()),
          ],
        ])
        .run();

      expect(storeState.reportUser.loading).toBe(false);
      expect(storeState.reportUser.errorMessage).toBe('An error occurred while reporting the user');
      expect(storeState.reportUser.successMessage).toBe('');
    });
  });

  describe('modal actions', () => {
    it('opens modal and sets reported user ID', async () => {
      const initialState = new StoreBuilder().build();

      const { storeState } = await expectSaga(openReportUserModal, { payload: { reportedUserId: 'user-123' } })
        .withReducer(rootReducer, initialState)
        .run();

      expect(storeState.reportUser.isReportUserModalOpen).toBe(true);
      expect(storeState.reportUser.reportedUserId).toBe('user-123');
    });

    it('closes modal and resets state', async () => {
      const initialState = new StoreBuilder()
        .withReportUser({
          isReportUserModalOpen: true,
          reportedUserId: 'user-123',
          errorMessage: 'error',
          successMessage: 'success',
        })
        .build();

      const { storeState } = await expectSaga(closeReportUserModal).withReducer(rootReducer, initialState).run();

      expect(storeState.reportUser.isReportUserModalOpen).toBe(false);
      expect(storeState.reportUser.reportedUserId).toBe('');
      expect(storeState.reportUser.errorMessage).toBe('');
      expect(storeState.reportUser.successMessage).toBe('');
    });
  });
});
