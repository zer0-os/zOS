import { saga } from './saga';
import { getHistory, getNavigator } from '../../lib/browser';
import { rootReducer } from '../reducer';
import { getCurrentUserWithChatAccessToken } from '../authentication/saga';
import { call } from 'redux-saga/effects';

import { expectSaga } from '../../test/saga';

jest.mock('../../config', () => ({
  config: {
    defaultZnsRoute: 'wilder',
    defaultApp: 'channels',
  },
}));

class StubHistory {
  pathname: string;
  location: object;

  constructor(pathname?: string) {
    this.pathname = pathname ?? '';
    this.location = { pathname };
  }

  replace = jest.fn();
}

describe('page-load saga', () => {
  let history: StubHistory;

  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [call(getHistory), history],
      [call(getCurrentUserWithChatAccessToken), true],
      [call(getNavigator), stubNavigator()],
    ]);
  }

  it('redirects to main page if user is present and tries to access login page', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/login');
    const { storeState: loginStoreState } = await subject(saga)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(history.replace).toHaveBeenCalledWith({ pathname: '/' });
    expect(loginStoreState.pageload.isComplete).toBe(true);
  });

  it('redirects to main page if user is present and tries to access signup page', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/get-access');
    const { storeState: getAccessStoreState } = await subject(saga)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(history.replace).toHaveBeenCalledWith({ pathname: '/' });
    expect(getAccessStoreState.pageload.isComplete).toBe(true);
  });

  it('sets isComplete to true, if user is not present & stays on login page', async () => {
    const initialState = { pageload: { isComplete: false } };

    let history = new StubHistory('/login');
    const {
      storeState: { pageload },
    } = await subject(saga)
      .withReducer(rootReducer, initialState as any)
      .provide([[call(getCurrentUserWithChatAccessToken), false]])
      .run();

    expect(pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalled();
  });

  it('redirects to login page if user is not present', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/');
    const { storeState } = await subject(saga)
      .provide([[call(getCurrentUserWithChatAccessToken), false]])
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.pageload.isComplete).toBe(true);
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/login' });
  });

  it('redirects authenticated user from /reset-password to main page', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/reset-password');
    const { storeState: resetPasswordStoreState } = await subject(saga)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(history.replace).toHaveBeenCalledWith({ pathname: '/' });
    expect(resetPasswordStoreState.pageload.isComplete).toBe(true);
  });

  it('allows unauthenticated user to stay on /reset-password page', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/reset-password');
    const { storeState: resetPasswordStoreState } = await subject(saga)
      .withReducer(rootReducer, initialState as any)
      .provide([[call(getCurrentUserWithChatAccessToken), false]])
      .run();

    expect(resetPasswordStoreState.pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalled();
  });

  describe('showAndroidDownload', () => {
    function subject(path: string, userAgent: string) {
      const initialState = { pageload: { showAndroidDownload: false } };
      return expectSaga(saga)
        .provide([
          [call(getHistory), new StubHistory(path)],
          [call(getCurrentUserWithChatAccessToken), false],
          [call(getNavigator), stubNavigator(userAgent)],
        ])
        .withReducer(rootReducer, initialState as any);
    }

    it('is false if not on a configured page', async () => {
      const { storeState } = await subject('/', 'Android').run();

      expect(storeState.pageload.showAndroidDownload).toBe(false);
    });

    it('is false if not an android user agent', async () => {
      const { storeState } = await subject('/login', 'Chrome').run();

      expect(storeState.pageload.showAndroidDownload).toBe(false);
    });

    it('is true if the user agent matches and is login page', async () => {
      const { storeState } = await subject('/login', 'Android').run();

      expect(storeState.pageload.showAndroidDownload).toBe(true);
    });

    it('is true if the user agent matches and is get-access page', async () => {
      const { storeState } = await subject('/get-access', 'Android').run();

      expect(storeState.pageload.showAndroidDownload).toBe(true);
    });
  });
});

function stubNavigator(userAgent: string = 'chrome') {
  return { userAgent };
}
