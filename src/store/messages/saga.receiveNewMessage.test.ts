import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import { getLinkPreviews } from './api';
import { getPreview, receiveNewMessage } from './saga';
import { rootReducer } from '../reducer';

import { mapMessage, send as sendBrowserNotification } from '../../lib/browser';
import { denormalize as denormalizeChannel } from '../channels';
import { stubResponse } from '../../test/saga';

describe(receiveNewMessage, () => {
  it('adds the link previews to the message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'message-id', message: 'www.google.com' };
    const stubPreview = { id: 'simulated-preview' };

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getPreview, 'www.google.com'), stubPreview),
        ...successResponses(),
      ])
      .withReducer(rootReducer)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(stubPreview);
  });

  it('sends a browser notification', async () => {
    const message = { id: 'message-id', message: '' };

    await expectSaga(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide(successResponses())
      .call(sendBrowserNotification, mapMessage(message as any))
      .run();
  });
});

function successResponses() {
  return [
    stubResponse(matchers.call.fn(getLinkPreviews), null),
    stubResponse(matchers.call.fn(sendBrowserNotification), undefined),
  ] as any;
}
