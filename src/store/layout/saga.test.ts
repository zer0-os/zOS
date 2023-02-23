import { expectSaga } from 'redux-saga-test-plan';
import { updateSidekick as updateSidekickSaga } from './saga';

import { reducer } from '.';

describe('layout saga', () => {
  beforeAll(() => {
    global.localStorage = {
      setItem: jest.fn(),
      getItem: (_) => '',
      removeItem: () => {},
      length: 0,
      clear: () => {},
      key: (_) => '',
    };
  });

  it('should store sidekick', async () => {
    const { storeState } = await expectSaga(updateSidekickSaga, { payload: { isOpen: true } })
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      value: {
        isSidekickOpen: true,
      },
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
