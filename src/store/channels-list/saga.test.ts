import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchChannels } from './api';
import { fetch } from './saga';

import { setStatus } from '.';
import { rootReducer } from '..';
import { AsyncListStatus } from '../normalized';

const MOCK_CHANNELS = [
  { name: 'channel 1' },
  { name: 'channel 2' },
  { name: 'channel 3' },
];
const unmockedFetch = global.fetch;

beforeAll(() => {
  global.fetch = () =>
    Promise.resolve({
      json: () => Promise.resolve(MOCK_CHANNELS),
    });
});

afterAll(() => {
  global.fetch = unmockedFetch;
});

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
          matchers.call.fn(fetchChannels),
          [],
        ],
      ])
      .call(fetchChannels, id)
      .run();
  });

  it('sets status to Idle', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    const {
      storeState: { channelsList },
    } = await expectSaga(fetch, { payload: id })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchChannels),
          [],
        ],
      ])
      .run();

    expect(channelsList.status).toBe(AsyncListStatus.Idle);
  });

  it('adds channel id to channelsList state', async () => {
    const id = 'channel-id';

    const {
      storeState: { channelsList },
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchChannels),
          [{ id }],
        ],
      ])
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
          matchers.call.fn(fetchChannels),
          [{ id, name }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels[id]).toStrictEqual({ id, name });
  });
});
