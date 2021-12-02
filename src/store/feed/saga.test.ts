import { expectSaga } from 'redux-saga-test-plan';

import { load } from './saga';
import { AsyncActionStatus, reducer } from '.';

describe('feed saga', () => {
  it('should set default data in store', async () => {
    const defaultItems = [{
      id: 'the-first-id',
      title: 'The First Item',
      description: 'This is the description of the first item.',
    }, {
      id: 'the-second-id',
      title: 'The Second Item',
      description: 'This is the description of the Second item.',
    }, {
      id: 'the-third-id',
      title: 'The Third Item',
      description: 'This is the description of the Third item.',
    }, {
      id: 'the-fourth-id',
      title: 'The Fourth Item',
      description: 'This is the description of the Fourth item.',
    }];

    await expectSaga(load)
      .withReducer(reducer)
      .hasFinalState({ value: defaultItems, status: AsyncActionStatus.Idle })
      .run();
  });
});
