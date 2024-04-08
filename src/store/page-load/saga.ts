import { call, put, select, spawn, take } from 'redux-saga/effects';
import { setEntryPath, setIsComplete, setShowAndroidDownload } from '.';
import { getHistory, getNavigator } from '../../lib/browser';
import { getCurrentUser } from '../authentication/saga';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';

const anonymousPaths = [
  '/get-access',
  '/login',
  '/reset-password',
];

export function* saga() {
  const history = yield call(getHistory);

  const success = yield call(getCurrentUser);
  if (success) {
    yield handleAuthenticatedUser(history);
  } else {
    yield handleUnauthenticatedUser(history);
    yield call(setMobileAppDownloadVisibility, history);
  }

  yield put(setIsComplete(true));
}

function handleAuthenticatedUser(history) {
  // if you have a current user but they still hit login/sign-up,
  // we should redirect to index page in that case
  if (anonymousPaths.includes(history.location.pathname)) {
    history.replace({
      pathname: '/',
    });
  }
}

function* handleUnauthenticatedUser(history) {
  if (anonymousPaths.includes(history.location.pathname)) {
    return;
  }

  yield put(setEntryPath(history.location.pathname));
  yield spawn(redirectOnUserLogin);
  yield history.replace({ pathname: '/login' });
}

const MOBILE_APP_DOWNLOAD_PATHS = [
  '/get-access',
  '/login',
];

function* setMobileAppDownloadVisibility(history) {
  const isMobileAppDownloadPath = MOBILE_APP_DOWNLOAD_PATHS.includes(history.location.pathname);
  if (isMobileAppDownloadPath) {
    const navigator = yield call(getNavigator);
    if (navigator.userAgent.match(/Android/i)) {
      yield put(setShowAndroidDownload(isMobileAppDownloadPath));
    }
  }
}

export function* redirectOnUserLogin() {
  const channel = yield call(getAuthChannel);
  yield take(channel, AuthEvents.UserLogin);
  yield redirectToEntryPath();
}

export function* redirectToEntryPath() {
  const entryPath = yield select((state) => state.pageload.entryPath);
  const history = yield call(getHistory);
  history.replace({ pathname: entryPath });
  yield put(setEntryPath(''));
}
