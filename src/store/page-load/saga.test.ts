import { expectSaga } from 'redux-saga-test-plan';
import { saga } from './saga';
import { getHistory, getNavigator } from '../../lib/browser';
import { rootReducer } from '../reducer';
import { getCurrentUserWithChatAccessToken } from '../authentication/saga';
import { call } from 'redux-saga/effects';
import { stubResponse } from '../../test/saga';

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
  it('redirects to main page if user is present tries to access login/signup page', async () => {
    const initialState = { pageload: { isComplete: false } };

    // login
    let history = new StubHistory('/login');
    const { storeState: loginStoreState } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, true))
      .run();

    // redirected from /login to /
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/' });
    expect(loginStoreState.pageload.isComplete).toBe(true);

    // signup
    history = new StubHistory('/get-access');
    const { storeState: getAccessStoreState } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, true))
      .run();

    // redirected from /get-access to /
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/' });
    expect(getAccessStoreState.pageload.isComplete).toBe(true);
  });

  it('sets isComplete to true, if user is not present & stays on login page', async () => {
    const initialState = {
      pageload: { isComplete: false },
    };

    let history = new StubHistory('/login');
    const {
      storeState: { pageload },
    } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, false))
      .run();

    expect(pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalled();
  });

  it('redirects to login page if user is not present and feature flag is not enabled', async () => {
    const initialState = {
      pageload: { isComplete: false },
    };

    const history = new StubHistory('/');
    const { storeState } = await expectSaga(saga)
      .provide(stubResponses(history, false))
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.pageload.isComplete).toBe(true);
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/login' });
  });

  it('redirects authenticated user from /reset-password to main page', async () => {
    const initialState = { pageload: { isComplete: false } };

    let history = new StubHistory('/reset-password');
    const { storeState: resetPasswordStoreState } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, true))
      .run();

    // redirected from /reset-password to /
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/' });
    expect(resetPasswordStoreState.pageload.isComplete).toBe(true);
  });

  it('allows unauthenticated user to stay on /reset-password page', async () => {
    const initialState = { pageload: { isComplete: false } };

    let history = new StubHistory('/reset-password');
    const { storeState: resetPasswordStoreState } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, false))
      .run();

    expect(resetPasswordStoreState.pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalled();
  });

  describe('showAndroidDownload', () => {
    async function expectPageLoad(path: string, userAgent: string) {
      const initialState = { pageload: { showAndroidDownload: false } };

      return await expectSaga(saga)
        .provide([
          stubResponse(call(getNavigator), stubNavigator(userAgent)),
          ...stubResponses(new StubHistory(path), false),
        ])
        .withReducer(rootReducer, initialState as any)
        .run();
    }

    it('is false if not on a configured page', async () => {
      const { storeState } = await expectPageLoad('/', 'Android');

      expect(storeState.pageload.showAndroidDownload).toBe(false);
    });

    it('is false if not an android user agent', async () => {
      const { storeState } = await expectPageLoad('/login', 'Chrome');

      expect(storeState.pageload.showAndroidDownload).toBe(false);
    });

    it('is true if the user agent matches and is login page', async () => {
      const { storeState } = await expectPageLoad('/login', 'Android');

      expect(storeState.pageload.showAndroidDownload).toBe(true);
    });

    it('is true if the user agent matches and is get-access page', async () => {
      const { storeState } = await expectPageLoad('/get-access', 'Android');

      expect(storeState.pageload.showAndroidDownload).toBe(true);
    });
  });
});

const stubResponses = (history, success, navigator = stubNavigator()) => {
  return [
    [
      call(getHistory),
      history,
    ],
    [
      call(getCurrentUserWithChatAccessToken),
      success,
    ],
    [
      call(getNavigator),
      navigator,
    ],
  ] as any;
};

function stubNavigator(userAgent: string = 'chrome') {
  return {
    userAgent,
  };
}
