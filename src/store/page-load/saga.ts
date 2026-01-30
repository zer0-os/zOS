import { call, put, select, spawn, take } from 'redux-saga/effects';
import { setEntryPath, setIsComplete, setShowAndroidDownload } from '.';
import { getHistory, getNavigator } from '../../lib/browser';
import { getCurrentUser } from '../authentication/saga';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';

const anonymousPaths = [
  '/get-access',
  '/login',
  '/reset-password',
  '/oauth/callback',
  '/oauth/link/callback',
];

const popupPaths = [
  '/oauth/link/callback',
];

// Allow mobile web login when coming from z-wallet auth flow
const MOBILE_WEB_ALLOWED_REFERRERS = ['z-wallet.zero.tech'];

const getAllowMobileWeb = (): boolean => {
  try {
    if (!document.referrer) return false;
    const referrerHost = new URL(document.referrer).host;
    return MOBILE_WEB_ALLOWED_REFERRERS.includes(referrerHost);
  } catch {
    return false;
  }
};

export function* saga() {
  const history = yield call(getHistory);
  const navigator = yield call(getNavigator);
  const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);

  if (isMobileDevice && !getAllowMobileWeb()) {
    history.replace({ pathname: '/restricted' });
    yield put(setIsComplete(true));
    return;
  }

  const result = yield call(getCurrentUser);
  if (result.success) {
    yield handleAuthenticatedUser(history);
  } else if (result.error === 'unauthenticated') {
    yield handleUnauthenticatedUser(history);
    yield call(setMobileAppDownloadVisibility, history);
  } else {
    yield handleCriticalError(history);
  }

  yield put(setIsComplete(true));
}

function handleAuthenticatedUser(history) {
  // if you have a current user but they still hit login/sign-up,
  // we should redirect to index page in that case
  const pathname = history.location.pathname;
  if (anonymousPaths.includes(pathname)) {
    // Because it's a popup and we don't want to redirect to the home page, the window will be closed
    if (popupPaths.includes(pathname)) return;

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

function* handleCriticalError(history) {
  yield history.replace({ pathname: '/error' });
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
