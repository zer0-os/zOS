import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { api } from './api';
import { fetch } from './saga';

import { setStatus } from '.';
import { rootReducer } from '..';
import { AsyncListStatus } from '../normalized';

describe('channels list saga', () => {
  it('sets status to fetching', async () => {
    await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(AsyncListStatus.Fetching))
      .run();
  });

  it('fetches channels', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: id })
      .provide([
        [
          matchers.call.fn(api.fetch),
          [],
        ],
      ])
      .call(api.fetch, id)
      .run();
  });

  it('adds channel id to channelsList state', async () => {
    const id = 'channel-id';

    const {
      storeState: { channelsList },
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(api.fetch),
          [{ id }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(channelsList.value).toStrictEqual([id]);
  });

  it('adds channels to normalized state', async () => {
    const id = 'channel-id';
    const name = 'the channel';

    const {
      storeState: { normalized },
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(api.fetch),
          [{ id, name }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels[id]).toStrictEqual({ id, name });
  });
});
