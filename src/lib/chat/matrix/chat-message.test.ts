import { AdminMessageType } from '../../../store/messages';
import { PowerLevels } from '../types';
import { getRoomPowerLevelsChangedAdminData } from './chat-message';

describe(getRoomPowerLevelsChangedAdminData, () => {
  it('returns null if previous content is not present', () => {
    const result = getRoomPowerLevelsChangedAdminData({ user: PowerLevels.Owner }, null);
    expect(result).toBeNull();
  });

  it('returns null if multiple user power levels are changed in the same event', () => {
    const result = getRoomPowerLevelsChangedAdminData(
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id-1': PowerLevels.Viewer,
          'user-matrix-id-2': PowerLevels.Moderator,
        },
      },
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id-1': PowerLevels.Moderator,
          'user-matrix-id-2': PowerLevels.Viewer,
        },
      }
    );
    expect(result).toBeNull();
  });

  it('returns MEMBER_SET_AS_MODERATOR if user is promoted to moderator (from 0 prev_content)', () => {
    const result = getRoomPowerLevelsChangedAdminData(
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id': PowerLevels.Moderator,
        },
      },
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id': PowerLevels.Viewer,
        },
      }
    );
    expect(result).toEqual({ type: AdminMessageType.MEMBER_SET_AS_MODERATOR, userId: 'user-matrix-id' });
  });

  it('returns MEMBER_SET_AS_MODERATOR if user is promoted to moderator (from empty prev_content)', () => {
    const result = getRoomPowerLevelsChangedAdminData(
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id': PowerLevels.Moderator,
        },
      },
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
        },
      }
    );
    expect(result).toEqual({ type: AdminMessageType.MEMBER_SET_AS_MODERATOR, userId: 'user-matrix-id' });
  });

  it('returns MEMBER_REMOVED_AS_MODERATOR if user is demoted from moderator (to 0 power_level)', () => {
    const result = getRoomPowerLevelsChangedAdminData(
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id': PowerLevels.Viewer,
        },
      },
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id': PowerLevels.Moderator,
        },
      }
    );
    expect(result).toEqual({ type: AdminMessageType.MEMBER_REMOVED_AS_MODERATOR, userId: 'user-matrix-id' });
  });

  it('returns MEMBER_REMOVED_AS_MODERATOR if user is demoted from moderator (to empty power_level)', () => {
    const result = getRoomPowerLevelsChangedAdminData(
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
        },
      },
      {
        users: {
          'admin-matrix-user-id': PowerLevels.Owner,
          'user-matrix-id': PowerLevels.Moderator,
        },
      }
    );
    expect(result).toEqual({ type: AdminMessageType.MEMBER_REMOVED_AS_MODERATOR, userId: 'user-matrix-id' });
  });
});
