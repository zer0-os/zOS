import { Channel, ConversationStatus, User } from '../../../store/channels';
import Matrix from './matrix-client-instance';
import { Room } from 'matrix-js-sdk/lib/models/room';
import { User as MatrixUser } from 'matrix-js-sdk/lib/models/user';
import { extractUserIdFromMatrixId } from './utils';

export class MatrixAdapter {
  /**
   * Maps a room to a channel with the data we can get from Matrix
   * @param room - The room to map
   * @returns Partial<Channel>
   */
  public static mapRoomToChannel(room: Room): Partial<Channel> {
    const icon = Matrix.client.getRoomAvatar(room);
    const createdAt = Matrix.client.getRoomCreatedAt(room);
    const labels = Object.keys(room.tags || {});
    const [admins, mods] = Matrix.client.getRoomAdminsAndMods(room);
    const isSocialChannel = Matrix.client.getRoomGroupType(room) === 'social';

    const members = Matrix.client.getRoomMembers(room.roomId);

    return {
      id: room.roomId,
      name: room.name,
      bumpStamp: room.getBumpStamp(),
      icon,
      otherMembers: members.otherMembers.map((m) => MatrixAdapter.mapMatrixUserToUser(m)),
      memberHistory: members.memberHistory.map((m) => MatrixAdapter.mapMatrixUserToUser(m)),
      totalMembers: members.totalMembers,
      createdAt,
      conversationStatus: ConversationStatus.CREATED,
      adminMatrixIds: admins,
      moderatorIds: mods,
      labels,
      isSocialChannel,
      // this isn't the best way to get the zid as it relies on the name format, but it's a quick fix
      zid: isSocialChannel ? room.name?.split('://')[1] : null,
    };
  }

  /**
   * Maps a matrix user to a user
   * @param matrixUser - The matrix user to map
   * @returns User
   */
  public static mapMatrixUserToUser(matrixUser: MatrixUser): User {
    return {
      userId: extractUserIdFromMatrixId(matrixUser.userId),
      matrixId: matrixUser.userId,
      firstName: matrixUser?.displayName,
      lastName: '',
      profileId: '',
      isOnline: false,
      profileImage: matrixUser?.avatarUrl,
      lastSeenAt: '',
      primaryZID: '',
    };
  }
}
