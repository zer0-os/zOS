import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';

export function* load() {
  const items = [{
    id: 'the-first-id',
    title: 'The First Item',
    description: 'This is the description of the first item.',
  }, {
    id: 'the-second-id',
    title: 'The Second Item',
    description: 'This is the description of the Second item.',
  }, {
    id: 'the-third-id',
    title: 'The Third Item',
    description: 'This is the description of the Third item.',
  }, {
    id: 'the-fourth-id',
    title: 'The Fourth Item',
    description: 'This is the description of the Fourth item.',
  }];

  yield put(receive(items));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Load, load);
}
