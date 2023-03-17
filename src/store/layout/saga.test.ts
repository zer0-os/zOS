import { expectSaga } from 'redux-saga-test-plan';
import { updateSidekick as updateSidekickSaga, syncSidekickState } from './saga';

import { reducer } from '.';

describe('layout saga', () => {
  const state = {
    authentication: {
      user: {
        data: {
          id: 'user-id',
        },
      },
    },
  };
  it('should store sidekick', async () => {
    const { storeState } = await expectSaga(updateSidekickSaga, { payload: { isOpen: true } })
      .withReducer(reducer, state as any)
      .run();

    expect(storeState).toMatchObject({
      value: {
        isSidekickOpen: true,
      },
    });

    expect(global.localStorage.setItem).toHaveBeenCalled();
  });

  it('should sync sidekick state', async () => {
    global.localStorage.getItem = jest.fn().mockReturnValue('true');

    const { storeState } = await expectSaga(syncSidekickState)
      .withReducer(reducer, state as any)
      .run();

    expect(storeState).toMatchObject({
      value: {
        isSidekickOpen: true,
      },
    });

    expect(global.localStorage.getItem).toHaveBeenNthCalledWith(1, 'user-id-isSidekickOpen');
  });
});
