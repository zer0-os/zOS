import { expectSaga } from 'redux-saga-test-plan';
import { saga } from './saga';
import { getHistory } from '../../lib/browser';
import { rootReducer } from '../reducer';
import { getCurrentUserWithChatAccessToken } from '../authentication/saga';
import { call } from 'redux-saga/effects';
import { initializePublicLayout } from '../layout/saga';

jest.mock('../../config', () => ({
  config: {
    defaultZnsRoute: 'wilder',
    defaultApp: 'channels',
  },
}));

const featureFlags = { allowPublicZOS: false };
jest.mock('../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
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

    // redirected from /login to /0.wilder.channels
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/0.wilder/channels' });
    expect(loginStoreState.pageload.isComplete).toBe(true);

    // signup
    history = new StubHistory('/get-access');
    const { storeState: getAccessStoreState } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, true))
      .run();

    // redirected from /get-access to /0.wilder.channels
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/0.wilder/channels' });
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

    const history = new StubHistory('/0.wilder/channels');
    const { storeState } = await expectSaga(saga)
      .provide(stubResponses(history, false))
      .withReducer(rootReducer, initialState as any)
      .not.call(initializePublicLayout)
      .run();

    expect(storeState.pageload.isComplete).toBe(true);
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/login' });
  });

  it('initializes public layout if user is not present but feature flag is enabled', async () => {
    const initialState = {
      pageload: { isComplete: false },
    };

    const history = new StubHistory('/0.wilder/channels');
    featureFlags.allowPublicZOS = true;
    const { storeState } = await expectSaga(saga)
      .provide(stubResponses(history, false))
      .withReducer(rootReducer, initialState as any)
      .call(initializePublicLayout)
      .run();

    expect(storeState.pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalledWith({ pathname: '/login' });
  });

  it('redirects authenticated user from /reset-password to main page', async () => {
    const initialState = { pageload: { isComplete: false } };

    let history = new StubHistory('/reset-password');
    const { storeState: resetPasswordStoreState } = await expectSaga(saga)
      .withReducer(rootReducer, initialState as any)
      .provide(stubResponses(history, true))
      .run();

    // redirected from /reset-password to /0.wilder.channels
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/0.wilder/channels' });
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
});

const stubResponses = (history, success) => {
  return [
    [
      call(getHistory),
      history,
    ],
    [
      call(getCurrentUserWithChatAccessToken),
      success,
    ],
  ] as any;
};
