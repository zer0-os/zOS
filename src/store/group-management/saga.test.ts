import { testSaga } from 'redux-saga-test-plan';
import { reset, startAddGroupMember } from './saga';
import { StoreBuilder } from '../test/store';
import { Stage, setStage } from '.';
import { expectSaga } from '../../test/saga';
import { rootReducer } from '../reducer';

describe('Group Management Saga', () => {
  describe(startAddGroupMember, () => {
    it('loops on handler stages', async () => {
      testSaga(startAddGroupMember).next().call(reset).next().put(setStage(Stage.StartAddMemberToRoom));
    });

    it('finishes when the next stage is None', async () => {
      testSaga(startAddGroupMember)
        .next()
        .next()
        .next()
        .next({ handlerResult: Stage.StartAddMemberToRoom })
        .put(setStage(Stage.StartAddMemberToRoom))
        .next()
        .next({ handlerResult: Stage.None })
        .put(setStage(Stage.None))
        .next()
        .call(reset);
    });

    it('moves back to the appropriate stage', async () => {
      testSaga(startAddGroupMember).next().next().next().next({ back: true }).put(setStage(Stage.None));
    });

    it('clears state if an error is thrown', async () => {
      testSaga(startAddGroupMember)
        .next()
        .next({ handlerResult: Stage.StartAddMemberToRoom })
        .throw(new Error('Stub error'))
        .call(reset);
    });

    it('clears state if a cancellation is received', async () => {
      testSaga(startAddGroupMember).next().next().next().next({ cancel: true }).next().call(reset);
    });
  });

  describe('reset', () => {
    it('resets to default state', async () => {
      const initialState = defaultState({
        stage: Stage.None,
        roomMembers: [],
      });

      const {
        storeState: { groupManagement: state },
      } = await expectSaga(reset).withReducer(rootReducer, initialState).run();

      expect(state).toEqual({
        stage: Stage.None,
        roomMembers: [],
      });
    });
  });
});

function defaultState(attrs = {}) {
  return new StoreBuilder()
    .withCurrentUser({ id: 'current-user-id' })
    .withOtherState({
      groupManagement: {
        stage: Stage.None,
        roomMembers: [],
        ...attrs,
      },
    })
    .build();
}
