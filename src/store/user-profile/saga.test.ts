import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import {
  openUserProfile,
  closeUserProfile,
  openEditProfile,
  openSettings,
  onPrivateReadReceipts,
  onPublicReadReceipts,
} from './saga';
import { UserProfileState, initialState as initialUserProfileState, Stage, setStage, setPublicReadReceipts } from '.';
import { rootReducer } from '../reducer';
import { User } from '../authentication/types';
import { setReadReceiptPreference } from '../../lib/chat';

describe('openUserProfile', () => {
  it('should set stage to Overview', async () => {
    const { storeState } = await expectSaga(openUserProfile)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.Overview))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.Overview);
  });
});

describe('openEditProfile', () => {
  it('should set stage to EditProfile', async () => {
    const { storeState } = await expectSaga(openEditProfile)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.EditProfile))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.EditProfile);
  });
});

describe('closeUserProfile', () => {
  it('should set stage to None', async () => {
    const initialStateWithOpenProfile = {
      ...initialState(),
      userProfile: {
        ...initialState().userProfile,
        stage: Stage.EditProfile,
      },
    };

    const { storeState } = await expectSaga(closeUserProfile)
      .withReducer(rootReducer, initialStateWithOpenProfile)
      .put(setStage(Stage.None))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.None);
  });
});

describe('openSettings', () => {
  it('should set stage to Settings', async () => {
    const { storeState } = await expectSaga(openSettings)
      .withReducer(rootReducer, initialState())
      .put(setStage(Stage.Settings))
      .run();

    expect(storeState.userProfile.stage).toEqual(Stage.Settings);
  });
});

describe('onPrivateReadReceipts', () => {
  it('should set read receipt preference to private and dispatch setPublicReadReceipts(false)', async () => {
    await expectSaga(onPrivateReadReceipts)
      .withReducer(rootReducer, initialState())
      .provide([
        [
          matchers.call.fn(setReadReceiptPreference),
          'private',
        ],
      ])
      .put(setPublicReadReceipts(false))
      .run();
  });
});

describe('onPublicReadReceipts', () => {
  it('should set read receipt preference to public and dispatch setPublicReadReceipts(true)', async () => {
    const initialStateWithPrivateReadReceipts = {
      ...initialState(),
      userProfile: {
        ...initialState().userProfile,
        isPublicReadReceipt: false,
      },
    };

    await expectSaga(onPublicReadReceipts)
      .withReducer(rootReducer, initialStateWithPrivateReadReceipts)
      .provide([
        [
          matchers.call.fn(setReadReceiptPreference),
          'public',
        ],
      ])
      .put(setPublicReadReceipts(true))
      .run();
  });
});

function initialState(userProfileAttrs: Partial<UserProfileState> = {}, data: Partial<User> = {}) {
  return {
    authentication: {
      user: {
        data: {
          ...data,
        },
      },
    },
    userProfile: {
      ...initialUserProfileState,
      ...userProfileAttrs,
    },
  } as any;
}
