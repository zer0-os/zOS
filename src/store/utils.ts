import uniqBy from 'lodash.uniqby';
import { actionChannel, call, delay, fork, race, take } from 'redux-saga/effects';
import { Events as AuthEvents, getAuthChannel } from './authentication/channels';
import { buffers } from 'redux-saga';

export function uniqNormalizedList(objectsAndIds: ({ id: string } | string)[], favorLast = false): any {
  if (favorLast) {
    return uniqFavorLast(objectsAndIds);
  }
  return uniqFavorFirst(objectsAndIds);
}

function uniqFavorFirst(objectsAndIds: ({ id: string } | string)[]): any {
  return uniqBy(objectsAndIds, (c) => c.id ?? c);
}

function uniqFavorLast(objectsAndIds: ({ id: string } | string)[]): any {
  const reversed = [...objectsAndIds].reverse();
  const uniqued = uniqBy(reversed, (c) => c.id ?? c);
  return uniqued.reverse();
}

export function* performUnlessLogout(task) {
  const { complete } = yield race({
    complete: task,
    abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
  });
  return !!complete;
}

// calls the task, and ignore further calls until the `delay` is over
export const leadingDebounce = (ms, pattern, task, ...args) =>
  fork(function* () {
    const throttleChannel = yield actionChannel(pattern, buffers.none());

    while (true) {
      const action = yield take(throttleChannel);
      yield fork(task, ...args, action);
      yield delay(ms);
    }
  });
