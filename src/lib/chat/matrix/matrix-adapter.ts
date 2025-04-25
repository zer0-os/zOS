import { Channel, ConversationStatus } from '../../../store/channels';
import matrixClientInstance from './matrix-client-instance';
import { IN_ROOM_MEMBERSHIP_STATES } from './types';
import { Room } from 'matrix-js-sdk/lib/models/room';
import { NotificationCountType } from 'matrix-js-sdk/lib/models/room';
import { User } from '../../../store/channels';
import { User as MatrixUser } from 'matrix-js-sdk/lib/models/user';
import { extractUserIdFromMatrixId } from './utils';

export class MatrixAdapter {
  public static async matrixInitialized() {
    await matrixClientInstance.connectionAwaiter;
  }

  /**
   * Returns a list of room ids that the user is a member of
   * @returns string[]
   */
  public static getChannelIds(): string[] {
    const rooms = matrixClientInstance.matrix.getRooms();
    return rooms
      .filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()))
      .map(({ roomId }) => roomId);
  }

  /**
   * Returns a list of channels that the user is a member of
   * @returns Partial<Channel>[]
   */
  public static getChannels(): Partial<Channel>[] {
    return matrixClientInstance.matrix
      .getRooms()
      .filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()))
      .map((room) => MatrixAdapter.mapRoomToChannel(room));
  }

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

    const members = MatrixAdapter.getRoomMembers(room.roomId);

    return {
      id: room.roomId,
      name: room.name,
      bumpStamp: room.getBumpStamp(),
      icon,
      otherMembers: members.otherMembers,
      memberHistory: members.memberHistory,
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

  /**
   * Returns the members of a channel
   * @param roomId - The id of the room
   * @returns { otherMembers: User[]; memberHistory: User[]; totalMembers: number }
   */
  public static getRoomMembers(
    roomId: string
  ): { otherMembers: User[]; memberHistory: User[]; totalMembers: number } | undefined {
    const room = matrixClientInstance.matrix.getRoom(roomId);
    if (room) {
      const otherMembers = matrixClientInstance
        .getOtherMembersFromRoom(room)
        .map((m) => matrixClientInstance.matrix.getUser(m.userId))
        .filter(Boolean)
        .map((user: MatrixUser) => MatrixAdapter.mapMatrixUserToUser(user));
      const memberHistory = room
        .getMembers()
        .map((m) => matrixClientInstance.matrix.getUser(m.userId))
        .filter(Boolean)
        .map((user: MatrixUser) => MatrixAdapter.mapMatrixUserToUser(user));
      return {
        otherMembers,
        memberHistory,
        totalMembers: room.getInvitedAndJoinedMemberCount(),
      };
    }
  }
}
