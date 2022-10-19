import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchChannels } from './api';
import { fetch, stopSyncChannels, unreadCountUpdated } from './saga';

import { setStatus } from '.';
import { rootReducer } from '..';
import { AsyncListStatus } from '../normalized';

const MOCK_CHANNELS = [
  { name: 'channel 1', url: 'channel_0001', icon: 'channel-icon' },
  { name: 'channel 2', url: 'channel_0002', icon: 'channel-icon' },
  { name: 'channel 3', url: 'channel_0003', icon: 'channel-icon' },
];

describe('channels list saga', () => {
  it('sets status to fetching', async () => {
    await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(AsyncListStatus.Fetching))
      .provide([
        [
          matchers.call.fn(fetchChannels),
          MOCK_CHANNELS,
        ],
      ])
      .run();
  });

  it('fetches channels', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: id })
      .provide([
        [
          matchers.call.fn(fetchChannels),
          MOCK_CHANNELS,
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
          MOCK_CHANNELS,
        ],
      ])
      .run();

    expect(channelsList.status).toBe(AsyncListStatus.Idle);
  });

  it('adds channel ids to channelsList state', async () => {
    const ids = [
      'channel_0001',
      'channel_0002',
      'channel_0003',
    ];
    const {
      storeState: { channelsList },
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchChannels),
          MOCK_CHANNELS,
        ],
      ])
      .run();

    expect(channelsList.value).toStrictEqual(ids);
  });

  it('adds channels to normalized state', async () => {
    const url = 'channel-0099';
    const name = 'the channel';
    const icon = 'channel-icon';
    const category = 'channel-category';
    const unreadCount = 1;

    const {
      storeState: { normalized },
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(fetchChannels),
          [{ url, name, icon, category, unreadCount }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels[url]).toStrictEqual({ id: url, name, icon, category, unreadCount });
  });

  it('set unreadCountUpdated on channels', async () => {
    const url = 'channel-1';
    const name = 'the channel';
    const icon = 'channel-icon';
    const category = 'channel-category';
    const unreadCount = 1;

    const {
      storeState: { normalized },
    } = await expectSaga(unreadCountUpdated, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(fetchChannels),
          [{ url, name, icon, category, unreadCount }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels[url]).toStrictEqual({ id: url, name, icon, category, unreadCount });
  });

  it('sets status to Stopped', async () => {
    const {
      storeState: { channelsList },
    } = await expectSaga(stopSyncChannels).withReducer(rootReducer).run();

    expect(channelsList.status).toBe(AsyncListStatus.Stopped);
  });
});
