import { redirectOnUserLogin, redirectToEntryPath, saga } from './saga';
import { getHistory, getNavigator } from '../../lib/browser';
import { rootReducer } from '../reducer';
import { getCurrentUser } from '../authentication/saga';
import { call, spawn } from 'redux-saga/effects';

import { expectSaga } from '../../test/saga';

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
      [call(getCurrentUser), true],
      [call(getNavigator), stubNavigator()],
      [spawn(redirectOnUserLogin), null],
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
      .provide([[call(getCurrentUser), false]])
      .run();

    expect(pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalled();
  });

  it('redirects to login page if user is not present', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/');
    const { storeState } = await subject(saga)
      .provide([[call(getCurrentUser), false]])
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.pageload.isComplete).toBe(true);
    expect(history.replace).toHaveBeenCalledWith({ pathname: '/login' });
  });

  it('saves the entry path when redirecting to the login page', async () => {
    history = new StubHistory('/some/path');
    const { storeState } = await subject(saga)
      .provide([[call(getCurrentUser), false]])
      .withReducer(rootReducer)
      .run();

    expect(storeState.pageload.entryPath).toEqual('/some/path');
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
      .provide([[call(getCurrentUser), false]])
      .run();

    expect(resetPasswordStoreState.pageload.isComplete).toBe(true);
    expect(history.replace).not.toHaveBeenCalled();
  });

  it('redirects to /restricted if on mobile', async () => {
    const initialState = { pageload: { isComplete: false } };

    history = new StubHistory('/');
    const { storeState } = await subject(saga)
      .provide([
        [call(getNavigator), stubNavigator('Mobi')],
      ])
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(history.replace).toHaveBeenCalledWith({ pathname: '/restricted' });
    expect(storeState.pageload.isComplete).toBe(true);
  });
});

describe(redirectToEntryPath, () => {
  it('redirects to the saved entry path', async () => {
    const initialState = { pageload: { entryPath: '/saved/path' } };
    const history = new StubHistory('/login');

    await expectSaga(redirectToEntryPath)
      .provide([[call(getHistory), history]])
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(history.replace).toHaveBeenCalledWith({ pathname: '/saved/path' });
  });

  it('resets the entry path state', async () => {
    const initialState = { pageload: { entryPath: '/saved/path' } };
    const history = new StubHistory('/login');

    const { storeState } = await expectSaga(redirectToEntryPath)
      .provide([[call(getHistory), history]])
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.pageload.entryPath).toEqual('');
  });
});

function stubNavigator(userAgent: string = 'chrome') {
  return { userAgent };
}
