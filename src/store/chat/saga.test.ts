import { expectSaga } from '../../test/saga';
import * as matchers from 'redux-saga-test-plan/matchers';

import { closeErrorDialog } from './saga';
import { openFirstConversation } from '../channels/saga';
import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';

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
