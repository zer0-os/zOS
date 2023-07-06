import { expectSaga } from 'redux-saga-test-plan';

import { saga } from './saga';

import { Apps } from '../../lib/apps';
import { getHistory } from '../../lib/browser';
import * as matchers from 'redux-saga-test-plan/matchers';

const stubHistory = (pathname) => {
  return {
    location: {
      pathname,
    },
    push: () => {},
    replace: (path) => {},
  };
};

describe('apps saga', () => {
  it('sets selected app', async () => {
    const {
      storeState: {},
    } = await expectSaga(saga)
      .provide([
        [
          matchers.call.fn(getHistory),
          {},
        ],
      ])
      .run();
  });
});
