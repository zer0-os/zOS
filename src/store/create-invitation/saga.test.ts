import { expectSaga } from 'redux-saga-test-plan';
import { fetchInvite } from './saga';
import { rootReducer } from '../reducer';
import { getInvite } from './api';
import { SagaActionTypes } from '.';
import { call } from 'redux-saga/effects';

jest.mock('../../config', () => ({ config: { inviteUrl: 'https://www.example.com/invite' } }));

describe('fetchInvite', () => {
  describe('fetchInvite', () => {
    it('fetches the invite information', async () => {
      const {
        storeState: { createInvitation },
      } = await expectSaga(fetchInvite)
        .provide([
          [
            call(getInvite),
            { slug: '98762' },
          ],
        ])
        .withReducer(rootReducer, {
          createInvitation: { code: '', url: '', isLoading: false },
        } as any)
        .dispatch({ type: SagaActionTypes.GetCode })
        .run();

      expect(createInvitation).toEqual({
        code: '98762',
        url: 'https://www.example.com/invite',
        isLoading: false,
      });
    });

    it('resets the state if a cancel event is received', async () => {
      const {
        storeState: { createInvitation },
      } = await expectSaga(fetchInvite)
        .withReducer(rootReducer, {
          createInvitation: { code: 'something', url: 'url', isLoading: false },
        } as any)
        .dispatch({ type: SagaActionTypes.Cancel })
        .run();

      expect(createInvitation).toEqual({ code: '', url: '', isLoading: false });
    });
  });
});
