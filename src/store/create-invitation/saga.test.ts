import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { fetchInvite } from './saga';
import { rootReducer } from '../reducer';
import { getInvite } from './api';

jest.mock('../../config', () => ({ config: { inviteUrl: 'https://www.example.com/invite' } }));

describe('fetchInvite', () => {
  describe('fetchInvite', () => {
    it('fetches the invite information', async () => {
      const {
        storeState: { createInvitation },
      } = await expectSaga(fetchInvite)
        .provide([
          [
            matchers.call.fn(getInvite),
            '98762',
          ],
        ])
        .withReducer(rootReducer, { createInvitation: { code: '', url: '' } } as any)
        .run();

      expect(createInvitation).toEqual({
        code: '98762',
        url: 'https://www.example.com/invite',
      });
    });
  });
});
