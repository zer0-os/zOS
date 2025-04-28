import { Channel, ConversationStatus, User } from '../../../store/channels';
import matrixClientInstance from './matrix-client-instance';
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
    const icon = matrixClientInstance.getRoomAvatar(room);
    const createdAt = matrixClientInstance.getRoomCreatedAt(room);
    const labels = Object.keys(room.tags || {});
    const [admins, mods] = matrixClientInstance.getRoomAdminsAndMods(room);

    const members = matrixClientInstance.getRoomMembers(room.roomId);

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
