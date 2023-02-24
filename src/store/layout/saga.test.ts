import { SidekickTabs } from './../../components/sidekick/types';
import { expectSaga } from 'redux-saga-test-plan';
import { updateSidekick as updateSidekickSaga, updateActiveSidekickTab } from './saga';

import { reducer } from '.';

describe('layout saga', () => {
  it('should store sidekick', async () => {
    const { storeState } = await expectSaga(updateSidekickSaga, { payload: { isOpen: true } })
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      value: {
        isSidekickOpen: true,
      },
    });

    expect(global.localStorage.setItem).toHaveBeenCalled();
  });

  it('should store active tab', async () => {
    const { storeState } = await expectSaga(updateActiveSidekickTab, { payload: { activeTab: SidekickTabs.MESSAGES } })
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      value: {
        activeSidekickTab: SidekickTabs.MESSAGES,
      },
    });

    expect(global.localStorage.setItem).toHaveBeenCalledWith('sidekick-tab', 'messages');
  });
});
