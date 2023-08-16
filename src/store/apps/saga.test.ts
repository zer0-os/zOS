import { expectSaga } from 'redux-saga-test-plan';

import { setSelectedApp } from './saga';

import { reducer } from '.';

import { Apps } from '../../lib/apps';

describe('apps saga', () => {
  it('sets selected app', async () => {
    const selectedAppType = Apps.Channels;

    const {
      storeState: { selectedApp },
    } = await expectSaga(setSelectedApp, { payload: selectedAppType }).withReducer(reducer).run();

    expect(selectedApp).toMatchObject({
      type: selectedAppType,
      name: 'Chat',
      imageSource:
        'https://res.cloudinary.com/fact0ry-dev/image/upload/v1649095368/zero-assets/zer0-os/apps/channels.svg',
    });
  });
});
