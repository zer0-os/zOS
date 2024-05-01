import { call, put, takeLatest } from 'redux-saga/effects';

import { SagaActionTypes, State, setError, setState } from '.';
import { submitUserFeedback as apiSubmitUserFeedback } from './api';

export function* submitFeedback(feedback: string) {
  yield put(setState(State.INPROGRESS));
  yield put(setError(''));

  try {
    const response = yield call(apiSubmitUserFeedback, feedback);
    if (response.success) {
      yield put(setState(State.SUCCESS));
      return;
    }
  } catch (e) {
    yield put(setError('Failed to submit feedback'));
  } finally {
    yield put(setState(State.LOADED));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SubmitFeedback, ({ payload }: any) => submitFeedback(payload.feedback));
}
