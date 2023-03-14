import { reducer, receiveNormalized, setStatus } from '.';
import { AsyncListStatus, AsyncNormalizedListState } from '../normalized';

describe('notificationsList reducer', () => {
  const initialExistingState: AsyncNormalizedListState = {
    status: AsyncListStatus.Idle,
    value: [],
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      status: AsyncListStatus.Idle,
      value: [],
    });
  });

  it('should replace existing state with new state', () => {
    const actual = reducer(initialExistingState, receiveNormalized(['the-id']));

    expect(actual).toStrictEqual({
      value: ['the-id'],
      status: AsyncListStatus.Idle,
    });
  });

  it('should replace existing status with new status', () => {
    const actual = reducer(initialExistingState, setStatus(AsyncListStatus.Fetching));

    expect(actual.status).toEqual(AsyncListStatus.Fetching);
  });
});
