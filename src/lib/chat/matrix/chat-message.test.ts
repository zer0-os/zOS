import { AdminMessageType } from '../../../store/messages';
import { PowerLevels } from '../types';
import { getRoomPowerLevelsChangedAdminData, parseMediaData, buildMediaObject } from './chat-message';
import { MsgType } from 'matrix-js-sdk';

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

describe(parseMediaData, () => {
  it('parses video message data correctly', async () => {
    const matrixMessage = {
      content: {
        msgtype: MsgType.Video,
        url: 'mxc://example.com/video123',
        info: {
          mimetype: 'video/mp4',
          size: 5000,
          name: 'test-video.mp4',
        },
      },
    };

    const result = await parseMediaData(matrixMessage);

    expect(result).toEqual({
      media: {
        url: 'mxc://example.com/video123',
        type: 'video',
        mimetype: 'video/mp4',
        size: 5000,
        name: 'test-video.mp4',
      },
      image: undefined,
      rootMessageId: '',
    });
  });

  it('parses audio message data correctly', async () => {
    const matrixMessage = {
      content: {
        msgtype: MsgType.Audio,
        url: 'mxc://example.com/audio123',
        info: {
          mimetype: 'audio/mpeg',
          size: 3000,
          name: 'test-audio.mp3',
        },
      },
    };

    const result = await parseMediaData(matrixMessage);

    expect(result).toEqual({
      media: {
        url: 'mxc://example.com/audio123',
        type: 'audio',
        mimetype: 'audio/mpeg',
        size: 3000,
        name: 'test-audio.mp3',
      },
      image: undefined,
      rootMessageId: '',
    });
  });
});

describe(buildMediaObject, () => {
  it('builds video media object correctly', async () => {
    const content = {
      msgtype: MsgType.Video,
      url: 'mxc://example.com/video123',
      info: {
        mimetype: 'video/mp4',
        size: 5000,
        name: 'test-video.mp4',
      },
    };

    const result = await buildMediaObject(content);

    expect(result).toEqual({
      url: 'mxc://example.com/video123',
      type: 'video',
      mimetype: 'video/mp4',
      size: 5000,
      name: 'test-video.mp4',
    });
  });

  it('builds encrypted video media object correctly', async () => {
    const content = {
      msgtype: MsgType.Video,
      file: {
        url: 'mxc://example.com/video123',
        key: { key: 'test-key' },
        iv: 'test-iv',
      },
      info: {
        mimetype: 'video/mp4',
        size: 5000,
        name: 'test-video.mp4',
      },
    };

    const result = await buildMediaObject(content);

    expect(result).toEqual({
      url: null,
      type: 'video',
      file: {
        url: 'mxc://example.com/video123',
        key: { key: 'test-key' },
        iv: 'test-iv',
      },
      mimetype: 'video/mp4',
      size: 5000,
      name: 'test-video.mp4',
    });
  });

  it('builds audio media object correctly', async () => {
    const content = {
      msgtype: MsgType.Audio,
      url: 'mxc://example.com/audio123',
      info: {
        mimetype: 'audio/mpeg',
        size: 3000,
        name: 'test-audio.mp3',
      },
    };

    const result = await buildMediaObject(content);

    expect(result).toEqual({
      url: 'mxc://example.com/audio123',
      type: 'audio',
      mimetype: 'audio/mpeg',
      size: 3000,
      name: 'test-audio.mp3',
    });
  });

  it('builds encrypted audio media object correctly', async () => {
    const content = {
      msgtype: MsgType.Audio,
      file: {
        url: 'mxc://example.com/audio123',
        key: { key: 'test-key' },
        iv: 'test-iv',
      },
      info: {
        mimetype: 'audio/mpeg',
        size: 3000,
        name: 'test-audio.mp3',
      },
    };

    const result = await buildMediaObject(content);

    expect(result).toEqual({
      url: null,
      type: 'audio',
      file: {
        url: 'mxc://example.com/audio123',
        key: { key: 'test-key' },
        iv: 'test-iv',
      },
      mimetype: 'audio/mpeg',
      size: 3000,
      name: 'test-audio.mp3',
    });
  });
});
