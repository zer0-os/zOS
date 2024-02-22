import { expectSaga as sourceExpectSaga } from 'redux-saga-test-plan';
import delayP from '@redux-saga/delay-p';
import { call } from 'redux-saga/effects';

export function stubResponse(matcher, response) {
  return [
    matcher,
    response,
  ] as any;
}

export function stubDelay(timeout: number) {
  // delayP is what delay calls behind the scenes. Not ideal but it works.
  return [call(delayP, timeout), true] as any;
}

// Wrap expectSaga to allow for multiple provide calls
// Calls may now be chained, and the stubs will be applied in reverse order
// which allows for setting up a default response and then overriding it
// in tests which need specific responses. See example usage below.
export function expectSaga(...args: Parameters<typeof sourceExpectSaga>) {
  const saga = sourceExpectSaga(...args);
  const originalProvide = saga.provide;

  let providedStubs = [];
  saga.provide = (stubs) => {
    providedStubs = [...stubs, ...providedStubs];
    return originalProvide.call(saga, providedStubs);
  };
  return saga;
}

// Example usage:
//  function remoteFunc(_arg1: string) {
//    throw new Error('api call should not be made in tests');
//  }
//
//  function* functionToTest() {
//    const result = yield call(remoteFunc, '5');
//    return { result, other: 'thing' };
//  }
//
// function subject() {
//   // Provide a default stub for the api call
//   return expectSaga(functionToTest).provide([[matchers.call.fn(remoteFunc), '']]);
// }
//
// it('returns result from api call', async () => {
//   const { returnValue } = await subject()
//      // Note: very specific matcher overrides the default matcher in tests
//      // where we care
//     .provide([[call(remoteFunc, '5'), 'specific result']])
//     .run();
//   expect(returnValue.result).toEqual('specific result');
// });
//
// it('returns other thing that does not depend on api call', async () => {
//   // No matcher required but we could have other provides calls here for
//   // for other stubbed calls
//   const { returnValue } = await subject().run();
//   expect(returnValue.other).toEqual('thing');
// });
