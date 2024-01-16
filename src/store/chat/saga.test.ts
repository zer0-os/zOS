import { expectSaga } from '../../test/saga';
import * as matchers from 'redux-saga-test-plan/matchers';

import { closeErrorDialog, performValidateActiveConversation, validateActiveConversation } from './saga';
import { openFirstConversation } from '../channels/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { User } from '../channels';
import { testSaga } from 'redux-saga-test-plan';
import { waitForChannelListLoad } from '../channels-list/saga';

describe(performValidateActiveConversation, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([]);
  }

  it('sets the dialog to closed if user is member of conversation', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversation({ id: 'convo-1' })
      .withChat({ isConversationErrorDialogOpen: true });

    const { storeState } = await subject(performValidateActiveConversation)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.isConversationErrorDialogOpen).toBe(false);
  });

  it('sets the dialog to open if user is NOT member of conversation', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({ id: 'current-user' })
      .withConversationList({ id: 'convo-1', name: 'Conversation 1', otherMembers: [{ userId: 'user-2' } as User] })
      .withActiveConversationId('convo-not-exists')
      .withChat({ isConversationErrorDialogOpen: false });

    const { storeState } = await subject(performValidateActiveConversation)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.chat.isConversationErrorDialogOpen).toBe(true);
  });
});

describe(closeErrorDialog, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([[matchers.call.fn(openFirstConversation), null]]);
  }

  it('sets the error dialog state', async () => {
    const initialState = new StoreBuilder().withChat({ isConversationErrorDialogOpen: true });
    const { storeState } = await subject(closeErrorDialog).withReducer(rootReducer, initialState.build()).run();

    expect(storeState.chat.isConversationErrorDialogOpen).toBe(false);
  });

  it('opens the first conversation', async () => {
    await subject(closeErrorDialog).withReducer(rootReducer).call(openFirstConversation).run();
  });
});

describe(validateActiveConversation, () => {
  it('waits for channel load before validating', async () => {
    testSaga(validateActiveConversation)
      .next()
      .call(waitForChannelListLoad)
      .next(true)
      .call(performValidateActiveConversation)
      .next()
      .isDone();
  });

  it('does not validate if channel load fails', async () => {
    testSaga(validateActiveConversation)
      .next()
      .call(waitForChannelListLoad)
      .next(false) // Channels did not load
      .isDone();
  });
});
